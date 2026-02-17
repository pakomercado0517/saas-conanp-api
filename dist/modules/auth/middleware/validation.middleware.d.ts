import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware de validación para registro de usuario
 *
 * Valida el body de la request usando RegisterSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateRegister: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para login de usuario
 *
 * Valida el body de la request usando LoginSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateLogin: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para refresh token
 *
 * Valida el body de la request usando RefreshTokenSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateRefreshToken: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para reenviar verificación de email
 */
export declare const validateResendVerification: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map