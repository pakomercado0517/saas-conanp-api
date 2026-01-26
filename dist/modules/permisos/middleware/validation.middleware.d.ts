import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware de validación para crear permiso
 *
 * Valida el body de la request usando CreatePermisoSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateCreatePermiso: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para actualizar permiso
 *
 * Valida el body de la request usando UpdatePermisoSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateUpdatePermiso: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para listar permisos
 *
 * Valida los query params de la request usando ListPermisosSchema de Zod.
 * Si la validación es exitosa, actualiza req.validatedQuery con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateListPermisos: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map