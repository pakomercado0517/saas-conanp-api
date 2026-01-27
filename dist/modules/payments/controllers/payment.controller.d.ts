import type { Request, Response } from 'express';
/**
 * Crea un Payment Intent en Stripe y guarda el pago en la base de datos.
 * El pago se crea con estado 'pending' y se actualiza cuando se confirma.
 *
 * POST /api/v1/organizations/:organizationId/payments/intent
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
export declare const createPaymentIntent: (req: Request, res: Response) => Promise<Response>;
/**
 * Confirma un pago actualizando el PaymentIntent en Stripe y el registro en la BD.
 *
 * POST /api/v1/organizations/:organizationId/payments/confirm
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
export declare const confirmPayment: (req: Request, res: Response) => Promise<Response>;
/**
 * Obtiene un pago por ID.
 * Valida que el pago pertenezca a la organización (multi-tenant).
 *
 * GET /api/v1/organizations/:organizationId/payments/:paymentId
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
export declare const getPaymentById: (req: Request, res: Response) => Promise<Response>;
/**
 * Lista pagos con paginación y filtros.
 * Todos los filtros son opcionales, pero siempre se filtra por organización (multi-tenant).
 *
 * GET /api/v1/organizations/:organizationId/payments
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
export declare const listPayments: (req: Request, res: Response) => Promise<Response>;
/**
 * Procesa un reembolso para un pago.
 * Puede ser reembolso total (si no se proporciona amount) o parcial (si se proporciona amount).
 * Solo los administradores pueden procesar reembolsos.
 *
 * POST /api/v1/organizations/:organizationId/payments/refund
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
 *
 * Nota: La autorización de admin se maneja en las rutas con el middleware requireAdmin
 */
export declare const processRefund: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=payment.controller.d.ts.map