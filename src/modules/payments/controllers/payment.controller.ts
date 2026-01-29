import type { Request, Response } from 'express';
import * as paymentService from '../services/payment.service.js';
import { sanitizePaymentForResponse } from '../sanitizers/payment-sanitizer.js';
import { sendSuccess, sendCreated, sendPaginated } from '@/shared/responses/helpers.js';
import type {
  CreatePaymentIntentDTO,
  ConfirmPaymentDTO,
  ListPaymentsDTO,
  ProcessRefundDTO,
} from '../validators/payment.validator.js';

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
export const createPaymentIntent = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const userId = req.user.userId;
  const data = req.body as CreatePaymentIntentDTO;

  const payment = await paymentService.createPaymentIntent(data, organizationId, userId);

  const sanitized = sanitizePaymentForResponse(payment, {
    includeClientSecret: true,
    includeMetadata: true,
  });
  return sendCreated(res, sanitized, 'Payment Intent creado exitosamente');
};

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
export const confirmPayment = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const userId = req.user.userId;
  const data = req.body as ConfirmPaymentDTO;

  const payment = await paymentService.confirmPayment(data, organizationId, userId);

  const sanitized = sanitizePaymentForResponse(payment, {
    includeClientSecret: false,
    includeMetadata: false,
  });
  return sendSuccess(res, sanitized, 'Pago confirmado exitosamente');
};

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
export const getPaymentById = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const paymentId = req.params['paymentId'] as string;
  const userId = req.user.userId;

  const payment = await paymentService.getPaymentById(paymentId, organizationId, userId);

  const sanitized = sanitizePaymentForResponse(payment, {
    includeClientSecret: false,
    includeMetadata: false,
  });
  return sendSuccess(res, sanitized, 'Pago obtenido exitosamente');
};

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
export const listPayments = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const userId = req.user.userId;
  // Usar validatedQuery si existe (cuando hay middleware de validación), sino usar req.query
  const filters =
    (req.validatedQuery as ListPaymentsDTO | undefined) ??
    (req.query as unknown as ListPaymentsDTO);

  const result = await paymentService.listPayments(organizationId, filters, userId);

  const sanitizedData = result.data.map((payment) =>
    sanitizePaymentForResponse(payment, {
      includeClientSecret: false,
      includeMetadata: false,
    })
  );
  return sendPaginated(res, sanitizedData, result.pagination, 'Pagos obtenidos exitosamente');
};

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
export const processRefund = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const userId = req.user.userId;
  const data = req.body as ProcessRefundDTO;

  const payment = await paymentService.processRefund(data, organizationId, userId);

  const sanitized = sanitizePaymentForResponse(payment, {
    includeClientSecret: false,
    includeMetadata: false,
  });
  return sendSuccess(res, sanitized, 'Reembolso procesado exitosamente');
};
