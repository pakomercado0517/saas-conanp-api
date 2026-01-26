import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware de validación para crear organización
 *
 * Valida el body de la request usando CreateOrganizationSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 */
export declare const validateCreateOrganization: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para actualizar organización
 *
 * Valida el body de la request usando UpdateOrganizationSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 */
export declare const validateUpdateOrganization: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para listar organizaciones
 *
 * Valida los query params usando ListOrganizationsSchema de Zod.
 * Si la validación es exitosa, actualiza req.query con los datos validados (coerción, defaults).
 * Si falla, retorna un error 400 con los detalles de validación en español.
 */
export declare const validateListOrganizations: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map