import type { Request, Response } from 'express';
/**
 * Registra un nuevo usuario
 *
 * POST /api/v1/auth/register
 */
export declare const register: (req: Request, res: Response) => Promise<Response>;
/**
 * Inicia sesión con email y contraseña
 *
 * POST /api/v1/auth/login
 */
export declare const login: (req: Request, res: Response) => Promise<Response>;
/**
 * Renueva un access token usando un refresh token
 *
 * POST /api/v1/auth/refresh
 */
export declare const refresh: (req: Request, res: Response) => Promise<Response>;
/**
 * Revoca un refresh token (logout)
 *
 * POST /api/v1/auth/logout
 */
export declare const logout: (req: Request, res: Response) => Promise<Response>;
/**
 * Verifica el correo electrónico con el token
 *
 * GET /api/v1/auth/verify-email?token=
 */
export declare const verifyEmail: (req: Request, res: Response) => Promise<Response>;
/**
 * Reenvía el email de verificación
 *
 * POST /api/v1/auth/resend-verification
 */
export declare const resendVerification: (req: Request, res: Response) => Promise<Response>;
/**
 * Solicita envío de email de recuperación de contraseña
 *
 * POST /api/v1/auth/forgot-password
 */
export declare const forgotPassword: (req: Request, res: Response) => Promise<Response>;
/**
 * Restablece la contraseña usando el token del email
 *
 * POST /api/v1/auth/reset-password
 */
export declare const resetPassword: (req: Request, res: Response) => Promise<Response>;
/**
 * Valida el token actual y retorna información del usuario autenticado
 *
 * GET /api/v1/auth/me
 */
export declare const me: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=auth.controller.d.ts.map