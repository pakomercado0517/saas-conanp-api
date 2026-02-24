import { Op } from 'sequelize';
import { SubscriptionPlan } from '@/modules/subscriptions/models/subscription-plan.model';
import { Subscription } from '@/modules/subscriptions/models/subscription.model';
import { stripeClient, handleStripeError, getDefaultCurrency } from '@/shared/stripe';
import { ConflictError, NotFoundError, ValidationError } from '@/shared/errors';
import { logger } from '@/shared/logger';
import { cache } from '@/shared/cache';
import { CacheKeys } from '@/shared/cache/keys';
import { cacheConfig } from '@/shared/cache/config';
/**
 * Invalida el caché de planes de suscripción.
 * Se llama después de CREATE/UPDATE/DELETE de planes.
 */
const invalidatePlanCache = async (planId) => {
    const keys = [CacheKeys.subscriptionPlans()];
    if (planId) {
        keys.push(CacheKeys.subscriptionPlan(planId));
    }
    await cache.del(keys);
    logger.debug({ keys }, 'Caché de planes de suscripción invalidado');
};
/**
 * Valida que el plan no tenga suscripciones activas.
 * Estados "en uso": active, trialing.
 *
 * @param planId - ID del plan
 * @throws {ConflictError} Si hay suscripciones activas
 */
export const assertPlanNotInUse = async (planId) => {
    const count = await Subscription.count({
        where: {
            planId,
            status: { [Op.in]: ['active', 'trialing'] },
        },
    });
    if (count > 0) {
        throw new ConflictError('El plan tiene suscripciones activas y no puede desactivarse ni eliminarse', { planId, activeSubscriptionsCount: count });
    }
};
/**
 * Lista planes de suscripción con paginación y filtros.
 * Público: no requiere autenticación ni contexto de organización.
 *
 * @param filters - Filtros de paginación y búsqueda
 * @returns Lista de planes y metadata de paginación
 */
export const listPlans = async (filters) => {
    const where = {};
    if (filters.name) {
        where['name'] = { [Op.iLike]: `%${filters.name}%` };
    }
    if (filters.active !== undefined) {
        where['active'] = filters.active;
    }
    const limit = filters.limit;
    const sortBy = filters.sortBy ?? 'createdAt';
    const sortOrder = filters.sortOrder ?? 'desc';
    const offset = (filters.page - 1) * limit;
    const result = await SubscriptionPlan.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sortBy, sortOrder]],
    });
    const totalPages = Math.ceil(result.count / limit);
    const pagination = {
        page: filters.page,
        limit,
        total: result.count,
        totalPages,
    };
    return { data: result.rows, pagination };
};
/**
 * Obtiene un plan por ID.
 *
 * @param planId - ID del plan
 * @returns Plan encontrado
 * @throws {NotFoundError} Si el plan no existe
 */
export const getPlanById = async (planId) => {
    const cacheKey = CacheKeys.subscriptionPlan(planId);
    // Intentar obtener del caché
    const cached = await cache.get(cacheKey);
    if (cached) {
        return cached;
    }
    // Si no está en caché, consultar la base de datos
    const plan = await SubscriptionPlan.findByPk(planId);
    if (!plan) {
        throw new NotFoundError('Plan de suscripción', { planId });
    }
    // Guardar en caché
    await cache.set(cacheKey, plan, cacheConfig.ttl.subscriptionPlan);
    return plan;
};
/**
 * Valida que el plan exista y esté activo.
 *
 * @param planId - ID del plan
 * @returns Plan encontrado y activo
 * @throws {NotFoundError} Si el plan no existe
 * @throws {ValidationError} Si el plan no está activo
 */
export const assertPlanExistsAndActive = async (planId) => {
    const plan = await getPlanById(planId);
    if (!plan.active) {
        throw new ValidationError('El plan no está activo y no puede utilizarse para suscripciones', 'planId', { planId, planName: plan.name });
    }
    return plan;
};
/**
 * Obtiene el plan gratuito "free" (activo).
 * Usado al crear una organización para asignarle una suscripción inicial sin Stripe.
 *
 * @param transaction - Transacción opcional
 * @returns Plan free
 * @throws {NotFoundError} Si no existe un plan "free" activo
 */
export const getFreePlan = async (transaction) => {
    const plan = await SubscriptionPlan.findOne({
        where: { name: 'free', active: true },
        ...(transaction && { transaction }),
    });
    if (!plan) {
        throw new NotFoundError('Plan de suscripción "free" no encontrado. Ejecuta el seed de planes (db:seed:all).', { planName: 'free' });
    }
    return plan;
};
/**
 * Obtiene un plan por Stripe Price ID (monthly o yearly).
 * Usado desde webhooks para resolver planId cuando solo se recibe price.id.
 *
 * @param stripePriceId - ID del precio en Stripe (price_xxx)
 * @returns Plan encontrado
 * @throws {NotFoundError} Si no existe un plan con ese precio
 */
export const getPlanByStripePriceId = async (stripePriceId) => {
    const plan = await SubscriptionPlan.findOne({
        where: {
            [Op.or]: [{ stripePriceIdMonthly: stripePriceId }, { stripePriceIdYearly: stripePriceId }],
        },
    });
    if (!plan) {
        throw new NotFoundError('Plan de suscripción', { stripePriceId });
    }
    return plan;
};
/**
 * Crea un plan de suscripción en la base de datos.
 * La sincronización con Stripe es una operación separada (syncPlanToStripe).
 *
 * @param data - Datos del plan
 * @returns Plan creado
 */
export const createPlan = async (data) => {
    const plan = await SubscriptionPlan.create({
        name: data.name,
        description: data.description ?? null,
        priceMonthly: data.priceMonthly,
        priceYearly: data.priceYearly,
        stripePriceIdMonthly: data.stripePriceIdMonthly ?? null,
        stripePriceIdYearly: data.stripePriceIdYearly ?? null,
        stripeProductId: data.stripeProductId ?? null,
        features: data.features ?? null,
        maxOrganizations: data.maxOrganizations ?? null,
        maxUsers: data.maxUsers ?? null,
        maxEventos: data.maxEventos ?? null,
        maxActividades: data.maxActividades ?? null,
        active: data.active ?? true,
    });
    // Invalidar caché después de crear plan
    await invalidatePlanCache();
    logger.info({ planId: plan.id, name: plan.name }, 'Plan de suscripción creado');
    return plan;
};
/**
 * Actualiza un plan de suscripción.
 * Si se desactiva (active=false), valida que no haya suscripciones activas.
 *
 * @param planId - ID del plan
 * @param data - Datos a actualizar
 * @returns Plan actualizado
 */
export const updatePlan = async (planId, data) => {
    const plan = await getPlanById(planId);
    if (data.active === false) {
        await assertPlanNotInUse(planId);
    }
    await plan.update({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.priceMonthly !== undefined && { priceMonthly: data.priceMonthly }),
        ...(data.priceYearly !== undefined && { priceYearly: data.priceYearly }),
        ...(data.stripePriceIdMonthly !== undefined && {
            stripePriceIdMonthly: data.stripePriceIdMonthly,
        }),
        ...(data.stripePriceIdYearly !== undefined && {
            stripePriceIdYearly: data.stripePriceIdYearly,
        }),
        ...(data.stripeProductId !== undefined && {
            stripeProductId: data.stripeProductId,
        }),
        ...(data.features !== undefined && { features: data.features }),
        ...(data.maxOrganizations !== undefined && {
            maxOrganizations: data.maxOrganizations,
        }),
        ...(data.maxUsers !== undefined && { maxUsers: data.maxUsers }),
        ...(data.maxEventos !== undefined && { maxEventos: data.maxEventos }),
        ...(data.maxActividades !== undefined && {
            maxActividades: data.maxActividades,
        }),
        ...(data.active !== undefined && { active: data.active }),
    });
    // Invalidar caché después de actualizar plan
    await invalidatePlanCache(planId);
    logger.info({ planId: plan.id }, 'Plan de suscripción actualizado');
    return plan;
};
/**
 * Elimina un plan (soft delete).
 * Valida que no haya suscripciones activas antes de eliminar.
 *
 * @param planId - ID del plan
 */
export const deletePlan = async (planId) => {
    const plan = await getPlanById(planId);
    await assertPlanNotInUse(planId);
    await plan.destroy();
    // Invalidar caché después de eliminar plan
    await invalidatePlanCache(planId);
    logger.info({ planId }, 'Plan eliminado (soft delete)');
};
/**
 * Sincroniza un plan con Stripe (Product y Prices).
 * Si no tiene stripeProductId: crea Product + 2 Prices (monthly, yearly).
 * Si ya tiene stripeProductId: actualiza solo el Product (name, description, active).
 *
 * @param planId - ID del plan
 * @returns Plan actualizado con IDs de Stripe
 */
export const syncPlanToStripe = async (planId) => {
    const plan = await getPlanById(planId);
    const currency = getDefaultCurrency().toLowerCase();
    const monthlyCents = Math.round(Number(plan.priceMonthly) * 100);
    const yearlyCents = Math.round(Number(plan.priceYearly) * 100);
    try {
        if (!plan.stripeProductId) {
            // Crear Product y Prices en Stripe
            const product = await stripeClient.products.create({
                name: plan.name,
                ...(plan.description != null && { description: plan.description }),
                active: plan.active,
            });
            const priceMonthly = await stripeClient.prices.create({
                currency,
                unit_amount: monthlyCents,
                recurring: { interval: 'month' },
                product: product.id,
            });
            const priceYearly = await stripeClient.prices.create({
                currency,
                unit_amount: yearlyCents,
                recurring: { interval: 'year' },
                product: product.id,
            });
            await plan.update({
                stripeProductId: product.id,
                stripePriceIdMonthly: priceMonthly.id,
                stripePriceIdYearly: priceYearly.id,
            });
            logger.info({
                planId: plan.id,
                stripeProductId: product.id,
                stripePriceIdMonthly: priceMonthly.id,
                stripePriceIdYearly: priceYearly.id,
            }, 'Plan sincronizado con Stripe (Product y Prices creados)');
        }
        else {
            // Actualizar Product existente
            await stripeClient.products.update(plan.stripeProductId, {
                name: plan.name,
                ...(plan.description != null && { description: plan.description }),
                active: plan.active,
            });
            logger.info({ planId: plan.id, stripeProductId: plan.stripeProductId }, 'Plan sincronizado con Stripe (Product actualizado)');
        }
    }
    catch (error) {
        handleStripeError(error);
    }
    // Invalidar caché después de sincronizar con Stripe
    await invalidatePlanCache(planId);
    return plan.reload();
};
//# sourceMappingURL=subscription-plan.service.js.map