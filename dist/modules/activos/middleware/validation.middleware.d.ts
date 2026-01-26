import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware de validación para crear activo
 *
 * Valida el body de la request usando CreateActivoSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateCreateActivo: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para actualizar activo
 *
 * Valida el body de la request usando UpdateActivoSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateUpdateActivo: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para listar activos
 *
 * Valida los query params usando ListActivosSchema de Zod.
 * Si la validación es exitosa, actualiza req.validatedQuery con los datos validados (coerción, defaults).
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateListActivos: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para crear requisito de activo
 *
 * Valida el body de la request usando CreateActivoRequisitoSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateCreateActivoRequisito: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para actualizar requisito de activo
 *
 * Valida el body de la request usando UpdateActivoRequisitoSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateUpdateActivoRequisito: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para listar requisitos de activo
 *
 * Valida los query params usando ListActivoRequisitosSchema de Zod.
 * Si la validación es exitosa, actualiza req.validatedQuery con los datos validados (coerción, defaults).
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateListActivoRequisitos: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map