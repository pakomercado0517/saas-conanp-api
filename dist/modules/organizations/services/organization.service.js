import { Op } from 'sequelize';
import { Organization } from '../../../modules/organizations/models/organization.model';
import { Subscription } from '../../../modules/subscriptions/models/subscription.model';
import { SubscriptionPlan } from '../../../modules/subscriptions/models/subscription-plan.model';
import { Membership } from '../../../modules/users/models/membership.model';
import { ForbiddenError, NotFoundError } from '../../../shared/errors';
import { logger } from '../../../shared/logger';
/** Estados de suscripción que permiten operaciones (no bloquean). */
const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing'];
/**
 * Valida que el usuario tenga acceso a la organización.
 * Verifica membresía activa (userId + organizationId, status 'activo').
 *
 * @throws {ForbiddenError} Si no existe membresía activa
 */
export const assertCanAccessOrganization = async (userId, organizationId) => {
    const membership = await Membership.findOne({
        where: {
            userId,
            organizationId,
            status: 'activo',
        },
    });
    if (!membership) {
        throw new ForbiddenError('No tienes acceso a esta organización', {
            organizationId,
            userId,
        });
    }
};
/**
 * Obtiene la suscripción de una organización (cualquier estado).
 */
const getSubscriptionByOrganization = async (organizationId) => {
    return Subscription.findOne({
        where: { organizationId },
        order: [['currentPeriodEnd', 'DESC']],
        include: [{ model: SubscriptionPlan, as: 'SubscriptionPlan' }],
    });
};
/**
 * Verifica que la organización tenga suscripción activa (active o trialing)
 * y que el periodo actual no haya vencido.
 * Bloquea si no hay suscripción, está inactiva/past_due/canceled o el periodo expiró.
 *
 * @throws {ForbiddenError} Si no hay suscripción, el estado no permite operaciones o está vencida
 */
export const assertActiveSubscription = async (organizationId) => {
    const subscription = await getSubscriptionByOrganization(organizationId);
    if (!subscription) {
        throw new ForbiddenError('La organización no tiene suscripción. Contrata un plan para continuar.', {
            organizationId,
        });
    }
    if (!ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) {
        throw new ForbiddenError(`La suscripción no está activa (estado: ${subscription.status}). Renueva o actualiza el pago para continuar.`, { organizationId, status: subscription.status });
    }
    const now = new Date();
    if (subscription.currentPeriodEnd < now) {
        throw new ForbiddenError('La suscripción está vencida. Renueva tu plan para continuar.', {
            organizationId,
            currentPeriodEnd: subscription.currentPeriodEnd,
        });
    }
};
/**
 * Obtiene el estado de la suscripción de la organización.
 *
 * @returns Estado y fecha de fin del periodo, o null si no hay suscripción
 */
export const getSubscriptionStatus = async (organizationId) => {
    const subscription = await getSubscriptionByOrganization(organizationId);
    if (!subscription)
        return null;
    return {
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
    };
};
/**
 * Obtiene la información del plan actual de la organización (solo si la suscripción está activa).
 *
 * @returns Información del plan y periodo, o null si no hay suscripción activa
 */
export const getCurrentPlanInfo = async (organizationId) => {
    const subscription = await getSubscriptionByOrganization(organizationId);
    if (!subscription?.SubscriptionPlan ||
        !ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) {
        return null;
    }
    const plan = subscription.SubscriptionPlan;
    return {
        planId: plan.id,
        planName: plan.name,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        limits: {
            maxUsers: plan.maxUsers ?? null,
            maxEventos: plan.maxEventos ?? null,
            maxActividades: plan.maxActividades ?? null,
        },
    };
};
/**
 * Crea una nueva organización.
 * No requiere validación de acceso (no hay organización previa).
 */
export const createOrganization = async (data) => {
    const org = await Organization.create({
        name: data.name,
        ecosystem_type: data.ecosystem_type,
        settings: data.settings ?? {},
    });
    logger.info({ organizationId: org.id, name: org.name, ecosystem_type: org.ecosystem_type }, 'Organización creada');
    return org;
};
/**
 * Obtiene una organización por ID.
 * Filtro multi-tenant: solo si el usuario tiene acceso vía membresía activa.
 * Bloquea si la organización no tiene suscripción activa.
 */
export const getOrganizationById = async (organizationId, userId) => {
    await assertCanAccessOrganization(userId, organizationId);
    await assertActiveSubscription(organizationId);
    const org = await Organization.findByPk(organizationId);
    if (!org) {
        throw new NotFoundError('Organización', { organizationId });
    }
    return org;
};
/**
 * Lista organizaciones con paginación y filtros.
 * Filtro multi-tenant obligatorio: solo organizaciones donde el usuario tiene membresía activa.
 */
export const listOrganizations = async (filters, userId) => {
    const memberships = await Membership.findAll({
        where: { userId, status: 'activo' },
        attributes: ['organizationId'],
    });
    const organizationIds = memberships.map((m) => m.organizationId);
    const limit = filters.limit;
    let total = 0;
    let rows = [];
    if (organizationIds.length === 0) {
        total = 0;
    }
    else {
        const where = {
            id: { [Op.in]: organizationIds },
        };
        if (filters.name) {
            where['name'] = { [Op.iLike]: `%${filters.name}%` };
        }
        if (filters.ecosystem_type) {
            where['ecosystem_type'] = filters.ecosystem_type;
        }
        const sortBy = filters.sortBy ?? 'createdAt';
        const sortOrder = filters.sortOrder ?? 'desc';
        const offset = (filters.page - 1) * limit;
        const result = await Organization.findAndCountAll({
            where,
            limit,
            offset,
            order: [[sortBy, sortOrder]],
        });
        rows = result.rows;
        total = result.count;
    }
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
 * Actualiza una organización.
 * Filtro multi-tenant: solo si el usuario tiene acceso.
 * Bloquea si la suscripción no está activa.
 */
export const updateOrganization = async (organizationId, data, userId) => {
    await assertCanAccessOrganization(userId, organizationId);
    await assertActiveSubscription(organizationId);
    const org = await Organization.findByPk(organizationId);
    if (!org) {
        throw new NotFoundError('Organización', { organizationId });
    }
    await org.update({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.ecosystem_type !== undefined && { ecosystem_type: data.ecosystem_type }),
        ...(data.settings !== undefined && { settings: data.settings }),
    });
    const updatedKeys = [
        data.name !== undefined && 'name',
        data.ecosystem_type !== undefined && 'ecosystem_type',
        data.settings !== undefined && 'settings',
    ].filter(Boolean);
    logger.info({ organizationId: org.id, userId, updates: updatedKeys }, 'Organización actualizada');
    return org;
};
/**
 * Elimina una organización (soft delete).
 * Filtro multi-tenant: solo si el usuario tiene acceso.
 * Bloquea si la suscripción no está activa.
 */
export const deleteOrganization = async (organizationId, userId) => {
    await assertCanAccessOrganization(userId, organizationId);
    await assertActiveSubscription(organizationId);
    const org = await Organization.findByPk(organizationId);
    if (!org) {
        throw new NotFoundError('Organización', { organizationId });
    }
    await org.destroy();
    logger.info({ organizationId, userId }, 'Organización eliminada (soft delete)');
};
//# sourceMappingURL=organization.service.js.map