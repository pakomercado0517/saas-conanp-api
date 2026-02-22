import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import { DateTime } from 'luxon';
import { Organization } from '../../../modules/organizations/models/organization.model';
import { Subscription } from '../../../modules/subscriptions/models/subscription.model';
import { SubscriptionPlan } from '../../../modules/subscriptions/models/subscription-plan.model';
import { createFreeSubscriptionForOrganization } from '../../../modules/subscriptions/services/subscription.service.js';
import { Membership } from '../../../modules/users/models/membership.model';
import { User } from '../../../modules/users/models/user.model';
import { Invitation } from '../../../modules/users/models/invitation.model';
import { BadRequestError, ConflictError, NotFoundError, ValidationError } from '../../../shared/errors';
import { logger } from '../../../shared/logger';
import { cache } from '../../../shared/cache';
import { CacheKeys } from '../../../shared/cache/keys';
import { sendInvitationEmail } from '../../../shared/email/email.service.js';
import { sequelize } from '../../../shared/database/index.js';
const BCRYPT_ROUNDS = 10;
const INVITATION_EXPIRES_DAYS = 7;
const invalidateOrganizationCache = async (organizationId) => {
    const cacheKey = CacheKeys.organization(organizationId);
    await cache.del(cacheKey);
};
/**
 * Crea una nueva organización (super admin).
 */
export const createOrganization = async (data, actor) => {
    return sequelize.transaction(async (transaction) => {
        const normalizedAdminEmail = data.admin_email.trim().toLowerCase();
        const org = await Organization.create({
            name: data.name,
            ecosystem_type: data.ecosystem_type,
            settings: data.settings ?? {},
        }, { transaction });
        const targetUser = await User.findOne({
            where: { email: normalizedAdminEmail },
            paranoid: false,
            transaction,
        });
        // Si existe pero está soft-deleted, bloquear explícitamente.
        if (targetUser?.deletedAt) {
            throw new ValidationError('No se puede asignar como admin a un usuario eliminado. Usa otro email.', undefined, {
                admin_email: normalizedAdminEmail,
            });
        }
        let adminAssignment;
        let membershipId;
        let invitationId;
        if (targetUser) {
            const existingMembership = await Membership.findOne({
                where: {
                    userId: targetUser.id,
                    organizationId: org.id,
                },
                transaction,
            });
            if (existingMembership) {
                throw new ConflictError('El usuario ya tiene una membresía en esta organización', {
                    userId: targetUser.id,
                    organizationId: org.id,
                    membershipId: existingMembership.id,
                });
            }
            const membership = await Membership.create({
                userId: targetUser.id,
                organizationId: org.id,
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
                organizationId: org.id,
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
                    organizationName: org.name,
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
        await createFreeSubscriptionForOrganization(org.id, transaction);
        logger.info({
            organizationId: org.id,
            name: org.name,
            ecosystem_type: org.ecosystem_type,
            adminAssignment,
            admin_email: normalizedAdminEmail,
            invitedByUserId: actor.userId,
        }, 'Organización creada por super admin con admin inicial');
        return {
            ...org.toJSON(),
            adminAssignment,
            adminEmail: normalizedAdminEmail,
            ...(membershipId && { membershipId }),
            ...(invitationId && { invitationId }),
        };
    });
};
/**
 * Lista todas las organizaciones con paginación y filtros.
 * Sin filtro de membresía — el super admin ve todas.
 * Incluye estado de suscripción y conteo de miembros.
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
    const { rows, count } = await Organization.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sortBy, sortOrder]],
        include: [
            {
                model: Subscription,
                as: 'Subscription',
                attributes: ['id', 'status', 'currentPeriodEnd', 'planId'],
                required: false,
                include: [
                    {
                        model: SubscriptionPlan,
                        as: 'SubscriptionPlan',
                        attributes: ['id', 'name'],
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
 * Obtiene una organización por ID con info de suscripción y miembros.
 * Sin validación de membresía — acceso directo para super admin.
 */
export const getOrganizationById = async (organizationId) => {
    const org = await Organization.findByPk(organizationId, {
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
    });
    if (!org) {
        throw new NotFoundError('Organización', { organizationId });
    }
    const membersCount = await Membership.count({
        where: { organizationId, status: 'activo' },
    });
    const result = org.toJSON();
    result['membersCount'] = membersCount;
    return result;
};
/**
 * Actualiza una organización sin validar membresía ni suscripción.
 */
export const updateOrganization = async (organizationId, data) => {
    const org = await Organization.findByPk(organizationId);
    if (!org) {
        throw new NotFoundError('Organización', { organizationId });
    }
    let newSettings;
    if (data.settings !== undefined) {
        const current = org.settings ?? {};
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
    await org.update({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.ecosystem_type !== undefined && { ecosystem_type: data.ecosystem_type }),
        ...(newSettings !== undefined && { settings: newSettings }),
    });
    await invalidateOrganizationCache(organizationId);
    logger.info({ organizationId: org.id }, 'Organización actualizada por super admin');
    return org;
};
/**
 * Elimina una organización (soft delete) sin validar membresía ni suscripción.
 */
export const deleteOrganization = async (organizationId) => {
    const org = await Organization.findByPk(organizationId);
    if (!org) {
        throw new NotFoundError('Organización', { organizationId });
    }
    await org.destroy();
    await invalidateOrganizationCache(organizationId);
    logger.info({ organizationId }, 'Organización eliminada por super admin (soft delete)');
};
//# sourceMappingURL=organization-admin.service.js.map