import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware de validación para crear actividad
 *
 * Valida el body de la request usando CreateActividadSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateCreateActividad: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para actualizar actividad
 *
 * Valida el body de la request usando UpdateActividadSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateUpdateActividad: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para listar actividades
 *
 * Valida los query params usando ListActividadesSchema de Zod.
 * Si la validación es exitosa, actualiza req.validatedQuery con los datos validados (coerción, defaults).
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateListActividades: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map