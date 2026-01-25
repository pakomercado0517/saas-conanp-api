import type { Response } from 'express';
import type { SuccessResponse, PaginatedResponse, PaginationMeta } from './types.js';

/**
 * Envía una respuesta exitosa estándar
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
  const response: SuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
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
 * Envía una respuesta paginada
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
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination,
    ...(message && { message }),
    timestamp: new Date().toISOString(),
  };

  return res.status(200).json(response);
};
