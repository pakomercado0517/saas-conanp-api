import { Router } from 'express';
import { createPaymentIntent, confirmPayment, getPaymentById, listPayments, processRefund, } from '../controllers/payment.controller.js';
import { validateCreatePaymentIntent, validateConfirmPayment, validateListPayments, validateProcessRefund, } from '../middleware/validation.middleware.js';
import { authenticate, requireOrganizationAccess, requireRole, requireAdmin, paymentCreateLimiter, } from '@/shared/middleware/index.js';
/**
 * Router de pagos
 *
 * Todas las rutas están bajo el prefijo /api/v1/organizations/:organizationId/payments
 * Requiere autenticación y acceso a la organización (middleware requireOrganizationAccess)
 */
const paymentRouter = Router({ mergeParams: true });
/**
 * POST /api/v1/organizations/:organizationId/payments/intent
 * Crea un Payment Intent en Stripe y guarda el pago en la base de datos.
 * El pago se crea con estado 'pending' y se actualiza cuando se confirma.
 * Solo admins y prestadores pueden crear pagos; prestadores solo para eventos donde son el prestador asignado.
 * Rate limiting estricto: 10 solicitudes por minuto por IP (producción).
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Body:
 * - eventoId: UUID (requerido)
 * - amount: number (requerido, decimal positivo, mínimo 0.01)
 * - currency: 'MXN' | 'USD' (requerido)
 * - metadata: object (opcional)
 * - paymentMethod: string (opcional, máximo 50 caracteres)
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: Payment con clientSecret,
 *   message: "Payment Intent creado exitosamente"
 * }
 */
paymentRouter.post('/intent', paymentCreateLimiter, authenticate, requireOrganizationAccess, requireRole(['admin', 'prestador']), validateCreatePaymentIntent, createPaymentIntent);
/**
 * POST /api/v1/organizations/:organizationId/payments/confirm
 * Confirma un pago actualizando el PaymentIntent en Stripe y el registro en la BD.
 * Solo admins y prestadores pueden confirmar; prestadores solo para eventos donde son el prestador asignado.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Body:
 * - paymentId: UUID (requerido)
 * - stripePaymentIntentId: string (requerido, debe comenzar con "pi_")
 * - paymentMethod: string (opcional, máximo 50 caracteres)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Payment actualizado con relaciones EventoOperativo y Organization,
 *   message: "Pago confirmado exitosamente"
 * }
 */
paymentRouter.post('/confirm', authenticate, requireOrganizationAccess, requireRole(['admin', 'prestador']), validateConfirmPayment, confirmPayment);
/**
 * GET /api/v1/organizations/:organizationId/payments
 * Lista pagos con paginación y filtros.
 * Solo se muestran pagos de la organización a la que el usuario tiene acceso.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Query:
 * - page: number (default 1)
 * - limit: number (default 20, max 100)
 * - sortBy: 'amount' | 'currency' | 'status' | 'createdAt' | 'updatedAt' | 'refundedAmount' (opcional)
 * - sortOrder: 'asc' | 'desc' (default 'desc')
 * - eventoId: UUID (opcional, filtro por evento)
 * - status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'cancelled' (opcional)
 * - currency: 'MXN' | 'USD' (opcional)
 * - dateFrom: string YYYY-MM-DD (opcional, filtro de fecha mínima)
 * - dateTo: string YYYY-MM-DD (opcional, filtro de fecha máxima)
 * - amountMin: number (opcional, decimal positivo, mínimo 0.01)
 * - amountMax: number (opcional, decimal positivo, mínimo 0.01)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Payment[] con relaciones EventoOperativo y Organization,
 *   pagination: { page, limit, total, totalPages },
 *   message: "Pagos obtenidos exitosamente"
 * }
 */
paymentRouter.get('/', authenticate, requireOrganizationAccess, validateListPayments, listPayments);
/**
 * GET /api/v1/organizations/:organizationId/payments/:paymentId
 * Obtiene un pago por ID.
 * Solo se puede ver si el pago pertenece a la organización del usuario.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - paymentId: UUID
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Payment con relaciones EventoOperativo y Organization,
 *   message: "Pago obtenido exitosamente"
 * }
 */
paymentRouter.get('/:paymentId', authenticate, requireOrganizationAccess, getPaymentById);
/**
 * POST /api/v1/organizations/:organizationId/payments/refund
 * Procesa un reembolso para un pago.
 * Puede ser reembolso total (si no se proporciona amount) o parcial (si se proporciona amount).
 * Solo los administradores pueden procesar reembolsos.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Body:
 * - paymentId: UUID (requerido)
 * - amount: number (opcional, decimal positivo, mínimo 0.01; si no se proporciona, reembolso total)
 * - reason: string (opcional, máximo 500 caracteres)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Payment actualizado con relaciones EventoOperativo y Organization,
 *   message: "Reembolso procesado exitosamente"
 * }
 */
paymentRouter.post('/refund', authenticate, requireOrganizationAccess, requireAdmin, validateProcessRefund, processRefund);
export default paymentRouter;
//# sourceMappingURL=payment.routes.js.map