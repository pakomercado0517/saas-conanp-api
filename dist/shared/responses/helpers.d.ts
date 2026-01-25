import type { Response } from 'express';
import type { PaginationMeta } from './types.js';
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
export declare const sendSuccess: <T>(res: Response, data: T, message?: string, statusCode?: number) => Response;
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
export declare const sendCreated: <T>(res: Response, data: T, message?: string) => Response;
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
export declare const sendNoContent: (res: Response) => Response;
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
export declare const sendPaginated: <T>(res: Response, data: T[], pagination: PaginationMeta, message?: string) => Response;
//# sourceMappingURL=helpers.d.ts.map