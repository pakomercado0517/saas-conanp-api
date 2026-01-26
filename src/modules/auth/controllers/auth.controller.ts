import type { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';
import { sendSuccess, sendCreated, sendNoContent } from '@/shared/responses/helpers.js';
import type { RegisterDTO, LoginDTO, RefreshTokenDTO } from '../validators/auth.validator.js';

/**
 * Registra un nuevo usuario
 *
 * POST /api/v1/auth/register
 */
export const register = async (req: Request, res: Response): Promise<Response> => {
  const data = req.body as RegisterDTO;
  const result = await authService.register(data);

  return sendCreated(res, result, 'Usuario registrado exitosamente');
};

/**
 * Inicia sesión con email y contraseña
 *
 * POST /api/v1/auth/login
 */
export const login = async (req: Request, res: Response): Promise<Response> => {
  const data = req.body as LoginDTO;
  const result = await authService.login(data);

  return sendSuccess(res, result, 'Inicio de sesión exitoso');
};

/**
 * Renueva un access token usando un refresh token
 *
 * POST /api/v1/auth/refresh
 */
export const refresh = async (req: Request, res: Response): Promise<Response> => {
  const data = req.body as RefreshTokenDTO;
  const result = await authService.refreshAccessToken(data.refreshToken);

  return sendSuccess(res, result, 'Token renovado exitosamente');
};

/**
 * Revoca un refresh token (logout)
 *
 * POST /api/v1/auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<Response> => {
  const data = req.body as RefreshTokenDTO;
  await authService.revokeRefreshToken(data.refreshToken);

  return sendNoContent(res);
};

/**
 * Valida el token actual y retorna información del usuario autenticado
 *
 * GET /api/v1/auth/me
 */
export const me = async (req: Request, res: Response): Promise<Response> => {
  // El token ya fue validado por el middleware de autenticación
  // req.user contiene el payload del JWT (userId, email)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  return sendSuccess(
    res,
    {
      userId: req.user.userId,
      email: req.user.email,
    },
    'Token válido'
  );
};
