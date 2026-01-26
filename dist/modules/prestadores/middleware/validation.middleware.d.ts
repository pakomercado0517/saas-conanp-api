import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware de validación para crear perfil de prestador
 *
 * Valida el body de la request usando CreatePrestadorProfileSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateCreatePrestadorProfile: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para actualizar perfil de prestador
 *
 * Valida el body de la request usando UpdatePrestadorProfileSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateUpdatePrestadorProfile: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para listar prestadores
 *
 * Valida los query params usando ListPrestadoresSchema de Zod.
 * Si la validación es exitosa, actualiza req.validatedQuery con los datos validados (coerción, defaults).
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateListPrestadores: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map