import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware de validación para crear evento
 *
 * Valida el body de la request usando CreateEventoSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateCreateEvento: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para actualizar evento
 *
 * Valida el body de la request usando UpdateEventoSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateUpdateEvento: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para listar eventos
 *
 * Valida los query params de la request usando ListEventosSchema de Zod.
 * Si la validación es exitosa, actualiza req.validatedQuery con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateListEventos: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map