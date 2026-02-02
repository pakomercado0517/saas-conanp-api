import type { Response } from 'express';
import type {
  SuccessResponse,
  PaginatedResponse,
  PaginationMeta,
  SubscriptionLimitsInfo,
} from './types.js';
import { SUBSCRIPTION_LIMITS_LOCALS_KEY } from '@/shared/middleware/subscription-limits.middleware.js';

/** Convierte LimitsAndUsage a SubscriptionLimitsInfo para la respuesta. */
const toLimitsInfo = (limitsAndUsage: {
  limits: {
    maxUsers: number | null;
    maxEventos: number | null;
    maxActividades: number | null;
    planName: string;
  };
  usage: { usersCount: number; eventosCount: number; actividadesCount: number };
}): SubscriptionLimitsInfo => ({
  limits: {
    maxUsers: limitsAndUsage.limits.maxUsers,
    maxEventos: limitsAndUsage.limits.maxEventos,
    maxActividades: limitsAndUsage.limits.maxActividades,
    planName: limitsAndUsage.limits.planName,
  },
  usage: limitsAndUsage.usage,
});

/**
 * Envía una respuesta exitosa estándar.
 * Si res.locals.subscriptionLimits está definido (por attachSubscriptionLimits),
 * incluye la información de límites en la respuesta.
 *
 * @param res - Objeto Response de Express
 * @param data - Datos a enviar en la respuesta
 * @param message - Mensaje opcional en español
 * @param statusCode - Código de estado HTTP (default: 200)
 * @returns Response de Express
 *
 * @example
 * ```typescript
 * sendSuccess(res, actividad, 'Actividad obtenida exitosamente');
 * ```
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const limitsData = res.locals?.[SUBSCRIPTION_LIMITS_LOCALS_KEY] as
    | Parameters<typeof toLimitsInfo>[0]
    | undefined;

  const response: SuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
    ...(limitsData && { limits: toLimitsInfo(limitsData) }),
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

/**
 * Envía una respuesta exitosa para recursos creados (201 Created)
 *
 * @param res - Objeto Response de Express
 * @param data - Datos del recurso creado
 * @param message - Mensaje opcional en español
 * @returns Response de Express
 *
 * @example
 * ```typescript
 * sendCreated(res, nuevaActividad, 'Actividad creada exitosamente');
 * ```
 */
export const sendCreated = <T>(res: Response, data: T, message?: string): Response => {
  return sendSuccess(res, data, message, 201);
};

/**
 * Envía una respuesta sin contenido (204 No Content)
 *
 * Usado típicamente para operaciones de eliminación exitosas
 * donde no hay datos que retornar.
 *
 * @param res - Objeto Response de Express
 * @returns Response de Express
 *
 * @example
 * ```typescript
 * sendNoContent(res);
 * ```
 */
export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};

/**
 * Envía una respuesta paginada.
 * Si res.locals.subscriptionLimits está definido (por attachSubscriptionLimits),
 * incluye la información de límites en la respuesta.
 *
 * @param res - Objeto Response de Express
 * @param data - Array de datos a enviar
 * @param pagination - Metadata de paginación
 * @param message - Mensaje opcional en español
 * @returns Response de Express
 *
 * @example
 * ```typescript
 * const pagination = {
 *   page: 1,
 *   limit: 20,
 *   total: 100,
 *   totalPages: 5
 * };
 * sendPaginated(res, actividades, pagination, 'Actividades obtenidas');
 * ```
 */
export const sendPaginated = <T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  message?: string
): Response => {
  const limitsData = res.locals?.[SUBSCRIPTION_LIMITS_LOCALS_KEY] as
    | Parameters<typeof toLimitsInfo>[0]
    | undefined;

  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination,
    ...(message && { message }),
    ...(limitsData && { limits: toLimitsInfo(limitsData) }),
    timestamp: new Date().toISOString(),
  };

  return res.status(200).json(response);
};
