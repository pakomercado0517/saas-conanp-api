import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware de validación para actualizar perfil de usuario
 *
 * Valida el body de la request usando UpdateProfileSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateUpdateProfile: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para cambiar contraseña
 *
 * Valida el body de la request usando ChangePasswordSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateChangePassword: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map