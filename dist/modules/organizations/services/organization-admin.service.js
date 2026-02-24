import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import { DateTime } from 'luxon';
import { Dependencia } from '@/modules/dependencias/models/dependencia.model.js';
import { Area } from '@/modules/areas/models/area.model.js';
import { Subscription } from '@/modules/subscriptions/models/subscription.model.js';
import { SubscriptionPlan } from '@/modules/subscriptions/models/subscription-plan.model.js';
import { createFreeSubscriptionForOrganization } from '@/modules/subscriptions/services/subscription.service.js';
import { Membership } from '@/modules/users/models/membership.model.js';
import { User } from '@/modules/users/models/user.model.js';
import { Invitation } from '@/modules/users/models/invitation.model.js';
import { BadRequestError, ConflictError, NotFoundError, ValidationError } from '@/shared/errors';
import { logger } from '@/shared/logger';
import { cache } from '@/shared/cache';
import { CacheKeys } from '@/shared/cache/keys';
import { sendInvitationEmail } from '@/shared/email/email.service.js';
import { sequelize } from '@/shared/database/index.js';
const BCRYPT_ROUNDS = 10;
const INVITATION_EXPIRES_DAYS = 7;
const invalidateOrganizationCache = async (areaId) => {
    const cacheKey = CacheKeys.organization(areaId);
    await cache.del(cacheKey);
};
/**
 * Crea una nueva organización (super admin).
 */
export const createOrganization = async (data, actor) => {
    return sequelize.transaction(async (transaction) => {
        const normalizedAdminEmail = data.admin_email.trim().toLowerCase();
        const dependencia = await Dependencia.create({ name: data.name, settings: data.settings ?? {} }, { transaction });
        const area = await Area.create({
            dependenciaId: dependencia.id,
            name: data.name,
            ecosystem_type: data.ecosystem_type,
            settings: data.settings ?? {},
        }, { transaction });
        const targetUser = await User.findOne({
            where: { email: normalizedAdminEmail },
            paranoid: false,
            transaction,
        });
        if (targetUser?.deletedAt) {
            throw new ValidationError('No se puede asignar como admin a un usuario eliminado. Usa otro email.', undefined, { admin_email: normalizedAdminEmail });
        }
        let adminAssignment;
        let membershipId;
        let invitationId;
        if (targetUser) {
            const existingMembership = await Membership.findOne({
                where: { userId: targetUser.id, areaId: area.id },
                transaction,
            });
            if (existingMembership) {
                throw new ConflictError('El usuario ya tiene una membresía en esta área', {
                    userId: targetUser.id,
                    areaId: area.id,
                    membershipId: existingMembership.id,
                });
            }
            const membership = await Membership.create({
                userId: targetUser.id,
                areaId: area.id,
                role: 'admin',
                status: 'activo',
            }, { transaction });
            adminAssignment = 'membership_created';
            membershipId = membership.id;
        }
        else {
            const token = randomBytes(32).toString('hex');
            const tokenHash = await bcrypt.hash(token, BCRYPT_ROUNDS);
            const expiresAt = DateTime.now().plus({ days: INVITATION_EXPIRES_DAYS }).toJSDate();
            const invitation = await Invitation.create({
                areaId: area.id,
                email: normalizedAdminEmail,
                role: 'admin',
                tokenHash,
                invitedBy: actor.userId,
                status: 'pending',
                expiresAt,
            }, { transaction });
            try {
                await sendInvitationEmail({
                    to: normalizedAdminEmail,
                    organizationName: area.name,
                    role: 'admin',
                    invitationId: invitation.id,
                    token,
                    invitedBy: actor.email,
                });
            }
            catch {
                throw new BadRequestError('No se pudo enviar la invitación del admin inicial. Intenta nuevamente.');
            }
            adminAssignment = 'invitation_created';
            invitationId = invitation.id;
        }
        await createFreeSubscriptionForOrganization(area.id, transaction);
        logger.info({
            areaId: area.id,
            dependenciaId: dependencia.id,
            name: area.name,
            ecosystem_type: area.ecosystem_type,
            adminAssignment,
            admin_email: normalizedAdminEmail,
            invitedByUserId: actor.userId,
        }, 'Dependencia y área creadas por super admin con admin inicial');
        return {
            ...area.toJSON(),
            adminAssignment,
            adminEmail: normalizedAdminEmail,
            ...(membershipId && { membershipId }),
            ...(invitationId && { invitationId }),
        };
    });
};
/**
 * Lista todas las áreas con paginación y filtros (super admin).
 * Incluye suscripción vía dependencia.
 */
export const listAllOrganizations = async (filters) => {
    const where = {};
    if (filters.name) {
        where['name'] = { [Op.iLike]: `%${filters.name}%` };
    }
    if (filters.ecosystem_type) {
        where['ecosystem_type'] = filters.ecosystem_type;
    }
    const sortBy = filters.sortBy ?? 'createdAt';
    const sortOrder = filters.sortOrder ?? 'desc';
    const limit = filters.limit;
    const offset = (filters.page - 1) * limit;
    const { rows, count } = await Area.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sortBy, sortOrder]],
        include: [
            {
                model: Dependencia,
                as: 'Dependencia',
                attributes: ['id', 'name'],
                required: true,
                include: [
                    {
                        model: Subscription,
                        as: 'Subscription',
                        attributes: ['id', 'status', 'currentPeriodEnd', 'planId'],
                        required: false,
                        include: [
                            { model: SubscriptionPlan, as: 'SubscriptionPlan', attributes: ['id', 'name'] },
                        ],
                    },
                ],
            },
        ],
    });
    const total = count;
    const totalPages = Math.ceil(total / limit);
    const pagination = {
        page: filters.page,
        limit,
        total,
        totalPages,
    };
    return { data: rows, pagination };
};
/**
 * Obtiene un área por ID con info de suscripción (vía dependencia) y miembros.
 */
export const getOrganizationById = async (areaId) => {
    const area = await Area.findByPk(areaId, {
        include: [
            {
                model: Dependencia,
                as: 'Dependencia',
                attributes: ['id', 'name'],
                required: true,
                include: [
                    {
                        model: Subscription,
                        as: 'Subscription',
                        attributes: [
                            'id',
                            'status',
                            'billingCycle',
                            'currentPeriodStart',
                            'currentPeriodEnd',
                            'cancelAtPeriodEnd',
                            'planId',
                        ],
                        required: false,
                        include: [
                            {
                                model: SubscriptionPlan,
                                as: 'SubscriptionPlan',
                                attributes: ['id', 'name', 'maxUsers', 'maxEventos', 'maxActividades'],
                            },
                        ],
                    },
                ],
            },
        ],
    });
    if (!area) {
        throw new NotFoundError('Área', { areaId });
    }
    const membersCount = await Membership.count({
        where: { areaId, status: 'activo' },
    });
    const result = area.toJSON();
    result['membersCount'] = membersCount;
    return result;
};
/**
 * Actualiza un área sin validar membresía ni suscripción (super admin).
 */
export const updateOrganization = async (areaId, data) => {
    const area = await Area.findByPk(areaId);
    if (!area) {
        throw new NotFoundError('Área', { areaId });
    }
    let newSettings;
    if (data.settings !== undefined) {
        const current = area.settings ?? {};
        const incoming = data.settings;
        const mergedAcceso = incoming['acceso'] != null
            ? {
                ...(current['acceso'] ?? {}),
                ...incoming['acceso'],
            }
            : current['acceso'];
        newSettings = {
            ...current,
            ...incoming,
            ...(mergedAcceso !== undefined && { acceso: mergedAcceso }),
        };
    }
    await area.update({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.ecosystem_type !== undefined && { ecosystem_type: data.ecosystem_type }),
        ...(newSettings !== undefined && { settings: newSettings }),
    });
    await invalidateOrganizationCache(areaId);
    logger.info({ areaId: area.id }, 'Área actualizada por super admin');
    return area;
};
/**
 * Elimina un área (soft delete) sin validar membresía ni suscripción (super admin).
 */
export const deleteOrganization = async (areaId) => {
    const area = await Area.findByPk(areaId);
    if (!area) {
        throw new NotFoundError('Área', { areaId });
    }
    await area.destroy();
    await invalidateOrganizationCache(areaId);
    logger.info({ areaId }, 'Área eliminada por super admin (soft delete)');
};
//# sourceMappingURL=organization-admin.service.js.map