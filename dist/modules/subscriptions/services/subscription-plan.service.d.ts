import type { UUID } from '../../../shared/database/types';
import { SubscriptionPlan } from '../../../modules/subscriptions/models/subscription-plan.model';
import type { CreateSubscriptionPlanDTO, UpdateSubscriptionPlanDTO, ListSubscriptionPlansDTO } from '../../../modules/subscriptions/validators/subscription-plan.validator';
import type { PaginationMeta } from '../../../shared/responses/types';
/**
 * Valida que el plan no tenga suscripciones activas.
 * Estados "en uso": active, trialing.
 *
 * @param planId - ID del plan
 * @throws {ConflictError} Si hay suscripciones activas
 */
export declare const assertPlanNotInUse: (planId: UUID) => Promise<void>;
/**
 * Lista planes de suscripción con paginación y filtros.
 * Público: no requiere autenticación ni contexto de organización.
 *
 * @param filters - Filtros de paginación y búsqueda
 * @returns Lista de planes y metadata de paginación
 */
export declare const listPlans: (filters: ListSubscriptionPlansDTO) => Promise<{
    data: SubscriptionPlan[];
    pagination: PaginationMeta;
}>;
/**
 * Obtiene un plan por ID.
 *
 * @param planId - ID del plan
 * @returns Plan encontrado
 * @throws {NotFoundError} Si el plan no existe
 */
export declare const getPlanById: (planId: UUID) => Promise<SubscriptionPlan>;
/**
 * Valida que el plan exista y esté activo.
 *
 * @param planId - ID del plan
 * @returns Plan encontrado y activo
 * @throws {NotFoundError} Si el plan no existe
 * @throws {ValidationError} Si el plan no está activo
 */
export declare const assertPlanExistsAndActive: (planId: UUID) => Promise<SubscriptionPlan>;
/**
 * Obtiene un plan por Stripe Price ID (monthly o yearly).
 * Usado desde webhooks para resolver planId cuando solo se recibe price.id.
 *
 * @param stripePriceId - ID del precio en Stripe (price_xxx)
 * @returns Plan encontrado
 * @throws {NotFoundError} Si no existe un plan con ese precio
 */
export declare const getPlanByStripePriceId: (stripePriceId: string) => Promise<SubscriptionPlan>;
/**
 * Crea un plan de suscripción en la base de datos.
 * La sincronización con Stripe es una operación separada (syncPlanToStripe).
 *
 * @param data - Datos del plan
 * @returns Plan creado
 */
export declare const createPlan: (data: CreateSubscriptionPlanDTO) => Promise<SubscriptionPlan>;
/**
 * Actualiza un plan de suscripción.
 * Si se desactiva (active=false), valida que no haya suscripciones activas.
 *
 * @param planId - ID del plan
 * @param data - Datos a actualizar
 * @returns Plan actualizado
 */
export declare const updatePlan: (planId: UUID, data: UpdateSubscriptionPlanDTO) => Promise<SubscriptionPlan>;
/**
 * Elimina un plan (soft delete).
 * Valida que no haya suscripciones activas antes de eliminar.
 *
 * @param planId - ID del plan
 */
export declare const deletePlan: (planId: UUID) => Promise<void>;
/**
 * Sincroniza un plan con Stripe (Product y Prices).
 * Si no tiene stripeProductId: crea Product + 2 Prices (monthly, yearly).
 * Si ya tiene stripeProductId: actualiza solo el Product (name, description, active).
 *
 * @param planId - ID del plan
 * @returns Plan actualizado con IDs de Stripe
 */
export declare const syncPlanToStripe: (planId: UUID) => Promise<SubscriptionPlan>;
//# sourceMappingURL=subscription-plan.service.d.ts.map