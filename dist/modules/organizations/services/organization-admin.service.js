import { Op } from 'sequelize';
import { Organization } from '../../../modules/organizations/models/organization.model';
import { Subscription } from '../../../modules/subscriptions/models/subscription.model';
import { SubscriptionPlan } from '../../../modules/subscriptions/models/subscription-plan.model';
import { Membership } from '../../../modules/users/models/membership.model';
import { NotFoundError } from '../../../shared/errors';
import { logger } from '../../../shared/logger';
import { cache } from '../../../shared/cache';
import { CacheKeys } from '../../../shared/cache/keys';
const invalidateOrganizationCache = async (organizationId) => {
    const cacheKey = CacheKeys.organization(organizationId);
    await cache.del(cacheKey);
};
/**
 * Crea una nueva organización (super admin).
 */
export const createOrganization = async (data) => {
    const org = await Organization.create({
        name: data.name,
        ecosystem_type: data.ecosystem_type,
        settings: data.settings ?? {},
    });
    logger.info({ organizationId: org.id, name: org.name, ecosystem_type: org.ecosystem_type }, 'Organización creada por super admin');
    return org;
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