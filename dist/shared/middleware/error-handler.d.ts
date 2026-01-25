import type { Request, Response, NextFunction } from 'express';
/**
 * Interfaz para contexto de request extendido
 */
interface RequestContext extends Request {
    user?: {
        id: string;
        email?: string;
    };
    organizationId?: string;
}
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
export declare const errorHandler: (err: unknown, req: RequestContext, res: Response, _next: NextFunction) => Response | void;
export {};
//# sourceMappingURL=error-handler.d.ts.map