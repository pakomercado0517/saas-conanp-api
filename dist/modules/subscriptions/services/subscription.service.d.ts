import { type Transaction } from 'sequelize';
import type { UUID, SubscriptionStatus, BillingCycle } from '../../../shared/database/types.js';
import { Subscription } from '../../../modules/subscriptions/models/subscription.model.js';
import type { PaginationMeta } from '../../../shared/responses/types.js';
import type { CreateSubscriptionDTO, UpdateSubscriptionDTO, CancelSubscriptionDTO, ListSubscriptionsDTO } from '../../../modules/subscriptions/validators/subscription.validator.js';
/**
 * Valida que la organización no tenga una suscripción activa.
 * Estados "activos" considerados: active, trialing.
 *
 * @param organizationId - ID de la organización
 * @throws {ConflictError} Si ya existe una suscripción activa
 */
export declare const assertNoActiveSubscription: (organizationId: UUID) => Promise<void>;
/**
 * Valida que la organización no tenga ninguna suscripción existente (incluye cancelada, incompleta).
 * Evita suscripciones duplicadas por organización (una org = una suscripción).
 *
 * @param organizationId - ID de la organización
 * @throws {ConflictError} Si ya existe una suscripción (cualquier estado)
 */
export declare const assertNoExistingSubscription: (organizationId: UUID) => Promise<void>;
/**
 * Obtiene el uso actual de una organización (usuarios, eventos, actividades).
 *
 * @param organizationId - ID de la organización
 * @returns Conteos de usuarios, eventos y actividades
 */
export declare const getOrganizationUsage: (organizationId: UUID) => Promise<{
    usersCount: number;
    eventosCount: number;
    actividadesCount: number;
}>;
/**
 * Valida que la organización no exceda los límites del plan.
 *
 * @param planId - ID del plan
 * @param organizationId - ID de la organización
 * @throws {ValidationError} Si se exceden los límites
 */
export declare const assertPlanLimits: (planId: UUID, organizationId: UUID) => Promise<void>;
/**
 * Crea una suscripción en Stripe.
 *
 * @param data - Datos para crear la suscripción
 * @param organizationId - ID de la organización (multi-tenant)
 * @param stripeCustomerId - ID del cliente en Stripe
 * @returns Objeto con la suscripción de Stripe y datos mapeados
 */
export declare const createSubscriptionInStripe: (data: CreateSubscriptionDTO, organizationId: UUID, stripeCustomerId: string) => Promise<{
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    stripePriceId: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    trialEnd: Date | null;
}>;
/**
 * Crea o actualiza una suscripción en la base de datos.
 *
 * @param data - Datos de la suscripción (provenientes de Stripe o manual)
 * @param transaction - Transacción opcional
 * @returns Suscripción creada o actualizada
 */
export declare const createSubscriptionInDatabase: (data: {
    organizationId: UUID;
    planId: UUID;
    status: SubscriptionStatus;
    billingCycle: BillingCycle;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd?: boolean;
    stripeSubscriptionId?: string | null;
    stripeCustomerId?: string | null;
    stripePriceId?: string | null;
    trialEnd?: Date | null;
    metadata?: Record<string, unknown> | null;
}, transaction?: Transaction) => Promise<Subscription>;
/**
 * Crea una suscripción FREE para una organización (sin Stripe).
 * Usado al crear una organización por super admin para que tenga suscripción activa
 * desde el inicio y el primer admin invitado pueda registrarse.
 *
 * @param organizationId - ID de la organización
 * @param transaction - Transacción opcional (ej. la de creación de la org)
 * @returns Suscripción creada con plan "free"
 * @throws {NotFoundError} Si no existe el plan "free"
 * @throws {ConflictError} Si la organización ya tiene suscripción
 */
export declare const createFreeSubscriptionForOrganization: (organizationId: UUID, transaction?: Transaction) => Promise<Subscription>;
/**
 * Crea una suscripción completa: Stripe + base de datos.
 *
 * @param data - Datos para crear la suscripción
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que crea (para validar acceso)
 * @returns Suscripción creada con relaciones
 */
export declare const createSubscription: (data: CreateSubscriptionDTO, organizationId: UUID, userId: UUID) => Promise<Subscription>;
/**
 * Obtiene la suscripción actual de una organización.
 * Filtro multi-tenant obligatorio.
 *
 * @param organizationId - ID de la organización
 * @param userId - ID del usuario (para validar acceso)
 * @returns Suscripción actual o null
 */
export declare const getSubscriptionByOrganization: (organizationId: UUID, userId: UUID) => Promise<Subscription | null>;
/**
 * Obtiene una suscripción por ID y valida que el usuario tenga acceso a la organización.
 * Usado para rutas que solo tienen subscriptionId en el path.
 *
 * @param subscriptionId - ID de la suscripción
 * @param userId - ID del usuario
 * @returns Suscripción encontrada
 */
export declare const getSubscriptionById: (subscriptionId: UUID, userId: UUID) => Promise<Subscription>;
/**
 * Obtiene el historial de facturación (invoices) de una suscripción desde Stripe.
 *
 * @param subscriptionId - ID de la suscripción
 * @param userId - ID del usuario
 * @param page - Página (default 1)
 * @param limit - Límite por página (default 20, max 100)
 * @returns Lista paginada de facturas
 */
export declare const getBillingHistory: (subscriptionId: UUID, userId: UUID, page?: number, limit?: number) => Promise<{
    data: Array<{
        id: string;
        number: string | null;
        status: string;
        amountDue: number;
        amountPaid: number;
        currency: string;
        created: number;
        invoicePdf: string | null;
        hostedInvoiceUrl: string | null;
    }>;
    pagination: PaginationMeta;
}>;
/**
 * Cambia el plan de una suscripción (upgrade/downgrade).
 *
 * @param subscriptionId - ID de la suscripción
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario
 * @param data - Datos del cambio (planId, billingCycle, prorate)
 * @returns Suscripción actualizada
 */
export declare const changePlan: (subscriptionId: UUID, organizationId: UUID, userId: UUID, data: UpdateSubscriptionDTO) => Promise<Subscription>;
/**
 * Cancela una suscripción.
 *
 * @param subscriptionId - ID de la suscripción
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario
 * @param data - Opciones de cancelación
 * @returns Suscripción actualizada
 */
export declare const cancelSubscription: (subscriptionId: UUID, organizationId: UUID, userId: UUID, data: CancelSubscriptionDTO) => Promise<Subscription>;
/**
 * Reactiva una suscripción cancelada (quita cancel_at_period_end).
 *
 * @param subscriptionId - ID de la suscripción
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario
 * @returns Suscripción actualizada
 */
export declare const reactivateSubscription: (subscriptionId: UUID, organizationId: UUID, userId: UUID) => Promise<Subscription>;
/**
 * Crea o actualiza una suscripción en BD desde el webhook customer.subscription.created.
 * Idempotente: si ya existe por stripeSubscriptionId, actualiza y retorna.
 *
 * @param stripeSubscription - Objeto subscription de Stripe (event.data.object)
 * @returns Suscripción creada/actualizada o null si falta organización o no existe
 */
export declare const createSubscriptionFromWebhook: (stripeSubscription: Record<string, unknown>) => Promise<Subscription | null>;
/**
 * Actualiza el estado de una suscripción desde un webhook de Stripe.
 * NO valida acceso a organización (se llama desde Stripe).
 *
 * @param stripeSubscription - Objeto subscription de Stripe (event.data.object)
 * @returns Suscripción actualizada o null si no existe
 */
export declare const updateSubscriptionFromWebhook: (stripeSubscription: Record<string, unknown>) => Promise<Subscription | null>;
/**
 * Renueva el período de suscripción desde invoice.payment_succeeded.
 * Solo actúa cuando billing_reason === 'subscription_cycle'.
 *
 * @param stripeInvoice - Objeto invoice de Stripe (event.data.object)
 * @returns Suscripción actualizada o null
 */
export declare const renewSubscriptionPeriodFromWebhook: (stripeInvoice: Record<string, unknown>) => Promise<Subscription | null>;
/**
 * Marca la suscripción como past_due desde invoice.payment_failed.
 *
 * @param stripeInvoice - Objeto invoice de Stripe (event.data.object)
 * @returns Suscripción actualizada o null
 */
export declare const markSubscriptionPastDueFromWebhook: (stripeInvoice: Record<string, unknown>) => Promise<Subscription | null>;
/**
 * Maneja customer.subscription.trial_will_end: log para auditoría y punto de extensión
 * para notificación (email/push) cuando exista el servicio.
 *
 * @param stripeSubscription - Objeto subscription de Stripe (event.data.object)
 */
export declare const handleTrialWillEndFromWebhook: (stripeSubscription: Record<string, unknown>) => Promise<void>;
/**
 * Lista suscripciones con paginación y filtros.
 * Si se proporciona organizationId, aplica filtro multi-tenant obligatorio.
 *
 * @param filters - Filtros y paginación
 * @param userId - ID del usuario (para validar acceso cuando hay organizationId)
 * @param organizationId - Opcional. Si se proporciona, filtra por organización y valida acceso.
 * @returns Lista paginada de suscripciones
 */
export declare const listSubscriptions: (filters: ListSubscriptionsDTO, userId: UUID, organizationId?: UUID) => Promise<{
    data: Subscription[];
    pagination: PaginationMeta;
}>;
//# sourceMappingURL=subscription.service.d.ts.map