import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware de manejo de errores globales
 *
 * Este middleware debe ser el último middleware registrado en la aplicación.
 * Captura todos los errores no manejados y los formatea de manera consistente.
 *
 * @param err - Error capturado
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express (no se usa, pero es requerido por Express)
 */
export declare const errorHandler: (err: unknown, req: Request, res: Response, _next: NextFunction) => Response | void;
//# sourceMappingURL=error-handler.d.ts.map