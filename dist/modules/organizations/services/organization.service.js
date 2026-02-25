import { Op } from 'sequelize';
import { Dependencia } from '../../../modules/dependencias/models/dependencia.model.js';
import { DependenciaMembership } from '../../../modules/dependencias/models/dependencia-membership.model.js';
import { Area } from '../../../modules/areas/models/area.model.js';
import { Subscription } from '../../../modules/subscriptions/models/subscription.model.js';
import { SubscriptionPlan } from '../../../modules/subscriptions/models/subscription-plan.model.js';
import { Membership } from '../../../modules/users/models/membership.model.js';
import { ForbiddenError, NotFoundError } from '../../../shared/errors/index.js';
import { logger } from '../../../shared/logger/index.js';
import { cache } from '../../../shared/cache/index.js';
import { CacheKeys } from '../../../shared/cache/keys.js';
import { cacheConfig } from '../../../shared/cache/config.js';
/** Estados de suscripción que permiten operaciones (no bloquean). */
const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing'];
/**
 * Invalida el caché de organización.
 * Se llama después de UPDATE/DELETE de organizaciones.
 */
const invalidateOrganizationCache = async (areaId) => {
    const cacheKey = CacheKeys.organization(areaId);
    await cache.del(cacheKey);
    logger.debug({ areaId, cacheKey }, 'Caché de área invalidado');
};
/**
 * Valida que el usuario tenga acceso a la organización.
 * Verifica membresía activa (userId + organizationId, status 'activo').
 *
 * @throws {ForbiddenError} Si no existe membresía activa
 */
/**
 * Valida que el usuario tenga acceso al área (membresía activa en esa área).
 */
export const assertCanAccessOrganization = async (userId, areaId) => {
    const membership = await Membership.findOne({
        where: {
            userId,
            areaId,
            status: 'activo',
        },
    });
    if (!membership) {
        throw new ForbiddenError('No tienes acceso a esta área', {
            areaId,
            userId,
        });
    }
};
/**
 * Valida que el usuario tenga acceso a la dependencia.
 * Primero comprueba DependenciaMembership (owner/admin en la dependencia); si no hay, comprueba membresía en al menos un área de esa dependencia.
 */
export const assertCanAccessDependencia = async (userId, dependenciaId) => {
    const depMembership = await DependenciaMembership.findOne({
        where: { userId, dependenciaId, status: 'activo' },
    });
    if (depMembership)
        return;
    const areasOfDep = await Area.findAll({
        where: { dependenciaId },
        attributes: ['id'],
    });
    const areaIds = areasOfDep.map((a) => a.id);
    if (areaIds.length === 0) {
        throw new ForbiddenError('Dependencia no encontrada', { dependenciaId, userId });
    }
    const membership = await Membership.findOne({
        where: {
            userId,
            areaId: { [Op.in]: areaIds },
            status: 'activo',
        },
    });
    if (!membership) {
        throw new ForbiddenError('No tienes acceso a esta dependencia', {
            dependenciaId,
            userId,
        });
    }
};
/**
 * Obtiene la suscripción de un área (vía dependencia). Cualquier estado.
 * Usa caché por dependenciaId.
 */
const getSubscriptionByOrganization = async (areaId) => {
    const area = await Area.findByPk(areaId);
    if (!area)
        return null;
    const dependenciaId = area.dependenciaId;
    const cacheKey = CacheKeys.activeSubscription(dependenciaId);
    const cached = await cache.get(cacheKey);
    if (cached)
        return cached;
    const subscription = await Subscription.findOne({
        where: { dependenciaId },
        order: [['currentPeriodEnd', 'DESC']],
        include: [{ model: SubscriptionPlan, as: 'SubscriptionPlan' }],
    });
    if (subscription) {
        await cache.set(cacheKey, subscription, cacheConfig.ttl.subscription);
    }
    return subscription;
};
/**
 * Verifica que la organización tenga suscripción activa (active o trialing)
 * y que el periodo actual no haya vencido.
 * Bloquea si no hay suscripción, está inactiva/past_due/canceled o el periodo expiró.
 *
 * @throws {ForbiddenError} Si no hay suscripción, el estado no permite operaciones o está vencida
 */
export const assertActiveSubscription = async (areaId) => {
    const subscription = await getSubscriptionByOrganization(areaId);
    if (!subscription) {
        throw new ForbiddenError('La dependencia no tiene suscripción. Contrata un plan para continuar.', { areaId });
    }
    if (!ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) {
        throw new ForbiddenError(`La suscripción no está activa (estado: ${subscription.status}). Renueva o actualiza el pago para continuar.`, { areaId, status: subscription.status });
    }
    const now = new Date();
    if (subscription.currentPeriodEnd < now) {
        throw new ForbiddenError('La suscripción está vencida. Renueva tu plan para continuar.', {
            areaId,
            currentPeriodEnd: subscription.currentPeriodEnd,
        });
    }
};
/**
 * Obtiene el estado de la suscripción de la organización.
 *
 * @returns Estado y fecha de fin del periodo, o null si no hay suscripción
 */
export const getSubscriptionStatus = async (areaId) => {
    const subscription = await getSubscriptionByOrganization(areaId);
    if (!subscription)
        return null;
    return {
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
    };
};
/**
 * Obtiene la configuración de brazaletes/pasaporte de una organización.
 * No valida acceso ni suscripción; usar después de assertCanAccessOrganization si aplica.
 *
 * @returns { brazaletesObligatorios, brazaletesExcluyenLocales } normalizado
 * @throws {NotFoundError} Si la organización no existe
 */
export const getBrazaletesConfig = async (areaId) => {
    const area = await Area.findByPk(areaId);
    if (!area) {
        throw new NotFoundError('Área', { areaId });
    }
    const acceso = area.settings?.['acceso'];
    const brazaletesObligatorios = acceso?.brazaletesObligatorios !== undefined ? acceso.brazaletesObligatorios : null;
    const brazaletesExcluyenLocales = acceso?.brazaletesExcluyenLocales === true;
    return {
        brazaletesObligatorios,
        brazaletesExcluyenLocales,
    };
};
/**
 * Obtiene la configuración de acceso (brazaletes/pasaporte) para el frontend.
 * Incluye organizationId, name y acceso (brazaletesObligatorios, brazaletesExcluyenLocales).
 * Valida que el usuario tenga acceso a la organización.
 */
export const getConfigAcceso = async (areaId, userId) => {
    await assertCanAccessOrganization(userId, areaId);
    const area = await Area.findByPk(areaId);
    if (!area) {
        throw new NotFoundError('Área', { areaId });
    }
    const acceso = await getBrazaletesConfig(areaId);
    return {
        organizationId: area.id,
        name: area.name,
        acceso,
    };
};
/**
 * Obtiene la información del plan actual de la organización (solo si la suscripción está activa).
 *
 * @returns Información del plan y periodo, o null si no hay suscripción activa
 */
export const getCurrentPlanInfo = async (areaId) => {
    const subscription = await getSubscriptionByOrganization(areaId);
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
 * Crea una nueva dependencia y su primera área (flujo admin / onboarding).
 * No requiere validación de acceso.
 */
export const createOrganization = async (data) => {
    const dependencia = await Dependencia.create({
        name: data.name,
        settings: data.settings ?? {},
    });
    const area = await Area.create({
        dependenciaId: dependencia.id,
        name: data.name,
        ecosystem_type: data.ecosystem_type,
        settings: data.settings ?? {},
    });
    logger.info({
        areaId: area.id,
        dependenciaId: dependencia.id,
        name: area.name,
        ecosystem_type: area.ecosystem_type,
    }, 'Dependencia y área creadas');
    return area;
};
/**
 * Obtiene un área por ID.
 * Filtro multi-tenant: solo si el usuario tiene acceso vía membresía activa.
 * Bloquea si la dependencia no tiene suscripción activa.
 */
export const getOrganizationById = async (areaId, userId) => {
    await assertCanAccessOrganization(userId, areaId);
    await assertActiveSubscription(areaId);
    const area = await Area.findByPk(areaId);
    if (!area) {
        throw new NotFoundError('Área', { areaId });
    }
    return area;
};
/**
 * Lista áreas con paginación y filtros.
 * Filtro multi-tenant: solo áreas donde el usuario tiene membresía activa.
 */
export const listOrganizations = async (filters, userId) => {
    const memberships = await Membership.findAll({
        where: { userId, status: 'activo' },
        attributes: ['areaId'],
    });
    const areaIds = memberships.map((m) => m.areaId);
    const limit = filters.limit;
    let total = 0;
    let rows = [];
    if (areaIds.length === 0) {
        total = 0;
    }
    else {
        const where = {
            id: { [Op.in]: areaIds },
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
        const result = await Area.findAndCountAll({
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
 * Actualiza un área.
 * Filtro multi-tenant: solo si el usuario tiene acceso.
 * Bloquea si la suscripción no está activa.
 */
export const updateOrganization = async (areaId, data, userId) => {
    await assertCanAccessOrganization(userId, areaId);
    await assertActiveSubscription(areaId);
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
    const updatedKeys = [
        data.name !== undefined && 'name',
        data.ecosystem_type !== undefined && 'ecosystem_type',
        data.settings !== undefined && 'settings',
    ].filter(Boolean);
    logger.info({ areaId: area.id, userId, updates: updatedKeys }, 'Área actualizada');
    return area;
};
/**
 * Elimina una organización (soft delete).
 * Filtro multi-tenant: solo si el usuario tiene acceso.
 * Bloquea si la suscripción no está activa.
 */
export const deleteOrganization = async (areaId, userId) => {
    await assertCanAccessOrganization(userId, areaId);
    await assertActiveSubscription(areaId);
    const area = await Area.findByPk(areaId);
    if (!area) {
        throw new NotFoundError('Área', { areaId });
    }
    await area.destroy();
    await invalidateOrganizationCache(areaId);
    logger.info({ areaId, userId }, 'Área eliminada (soft delete)');
};
//# sourceMappingURL=organization.service.js.map