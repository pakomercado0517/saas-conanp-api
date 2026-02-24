import type { UUID } from '@/shared/database/types.js';
import { Payment } from '@/modules/payments/models/payment.model.js';
import type { PaginationMeta } from '@/shared/responses/types.js';
import type { CreatePaymentIntentDTO, ConfirmPaymentDTO, ListPaymentsDTO, ProcessRefundDTO } from '@/modules/payments/validators/payment.validator.js';
/**
 * Crea un Payment Intent en Stripe y guarda el pago en la base de datos.
 * El pago se crea con estado 'pending' y se actualiza cuando se confirma.
 *
 * @param data - Datos para crear la intención de pago
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que crea el pago
 * @returns Pago creado con stripePaymentIntentId y clientSecret
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el evento no existe o no pertenece a la organización
 * @throws {ValidationError} Si el monto no es válido
 */
export declare const createPaymentIntent: (data: CreatePaymentIntentDTO, organizationId: UUID, userId: UUID) => Promise<Payment & {
    clientSecret: string;
}>;
/**
 * Confirma un pago actualizando el PaymentIntent en Stripe y el registro en la BD.
 *
 * @param data - Datos para confirmar el pago
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que confirma el pago
 * @returns Pago actualizado con relaciones cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el pago no existe o no pertenece a la organización
 * @throws {ValidationError} Si el pago no está en estado válido para confirmar
 */
export declare const confirmPayment: (data: ConfirmPaymentDTO, organizationId: UUID, userId: UUID) => Promise<Payment>;
/**
 * Obtiene un pago por ID.
 * Valida que el pago pertenezca a la organización (multi-tenant).
 *
 * @param paymentId - ID del pago
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que solicita
 * @returns Pago encontrado con relaciones cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el pago no existe o no pertenece a la organización
 */
export declare const getPaymentById: (paymentId: UUID, organizationId: UUID, userId: UUID) => Promise<Payment>;
/**
 * Lista pagos con paginación y filtros.
 * Todos los filtros son opcionales, pero siempre se filtra por organización (multi-tenant).
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros de paginación y búsqueda
 * @param userId - ID del usuario que solicita
 * @returns Datos paginados de pagos con relaciones cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 */
export declare const listPayments: (organizationId: UUID, filters: ListPaymentsDTO, userId: UUID) => Promise<{
    data: Payment[];
    pagination: PaginationMeta;
}>;
/**
 * Procesa un reembolso para un pago.
 * Puede ser reembolso total (si no se proporciona amount) o parcial (si se proporciona amount).
 *
 * @param data - Datos para procesar el reembolso
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que procesa el reembolso
 * @returns Pago actualizado con relaciones cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el pago no existe o no pertenece a la organización
 * @throws {ValidationError} Si el pago no está en estado válido o el monto es inválido
 */
export declare const processRefund: (data: ProcessRefundDTO, organizationId: UUID, userId: UUID) => Promise<Payment>;
/**
 * Idempotencia de webhooks Stripe.
 * Inserta el evento en stripe_webhook_events. Si ya existe (UniqueConstraintError),
 * devuelve true (omitir procesamiento). Si insert OK, devuelve false (procesar).
 *
 * @param eventId - ID del evento Stripe (evt_xxx)
 * @param eventType - Tipo de evento (ej. payment_intent.succeeded)
 * @returns true si el evento ya fue procesado (duplicado), false si es nuevo
 */
export declare const ensureEventIdempotency: (eventId: string, eventType: string) => Promise<boolean>;
/**
 * Actualiza el pago cuando Stripe envía charge.refunded.
 * Busca el pago por payment_intent del charge, actualiza refundedAmount, refundedAt
 * y status = 'refunded' si el reembolso es total.
 *
 * @param charge - Objeto charge del webhook (event.data.object)
 * @returns Pago actualizado o null si no se encuentra
 */
export declare const handleChargeRefundedFromWebhook: (charge: Record<string, unknown>) => Promise<Payment | null>;
/**
 * Actualiza el estado de un pago desde un webhook de Stripe.
 * Esta función NO valida acceso a organización ya que se llama directamente desde Stripe.
 *
 * @param stripePaymentIntentId - ID del PaymentIntent en Stripe
 * @param eventType - Tipo de evento de Stripe (payment_intent.succeeded, payment_intent.payment_failed, etc.)
 * @param eventData - Datos del evento de Stripe
 * @returns Pago actualizado con relaciones cargadas
 * @throws {NotFoundError} Si el pago no existe
 * @throws {ValidationError} Si el tipo de evento no es válido
 */
export declare const updatePaymentStatusFromWebhook: (stripePaymentIntentId: string, eventType: string, eventData: Record<string, unknown>) => Promise<Payment>;
//# sourceMappingURL=payment.service.d.ts.map