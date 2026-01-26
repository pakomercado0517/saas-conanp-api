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
 * Valida el token actual y retorna información del usuario autenticado
 *
 * GET /api/v1/auth/me
 */
export declare const me: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=auth.controller.d.ts.map