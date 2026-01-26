import { Router } from 'express';
import { register, login, refresh, logout, me } from '../controllers/auth.controller.js';
import { validateRegister, validateLogin, validateRefreshToken, } from '../middleware/validation.middleware.js';
import { authenticate } from '../../../shared/middleware/index.js';
import { authLimiter } from '../../../shared/middleware/index.js';
/**
 * Router de autenticación
 *
 * Todas las rutas están bajo el prefijo /api/v1/auth
 */
const authRouter = Router();
/**
 * POST /api/v1/auth/register
 * Registra un nuevo usuario
 *
 * Body:
 * - email: string (email válido)
 * - password: string (mínimo 8 caracteres)
 * - name: string (mínimo 1 carácter, máximo 255)
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: {
 *     user: { id, email, name },
 *     accessToken: string,
 *     refreshToken: string,
 *     expiresIn: number
 *   },
 *   message: "Usuario registrado exitosamente"
 * }
 */
authRouter.post('/register', authLimiter, validateRegister, register);
/**
 * POST /api/v1/auth/login
 * Inicia sesión con email y contraseña
 *
 * Body:
 * - email: string (email válido)
 * - password: string (no vacío)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: {
 *     user: { id, email, name },
 *     accessToken: string,
 *     refreshToken: string,
 *     expiresIn: number
 *   },
 *   message: "Inicio de sesión exitoso"
 * }
 */
authRouter.post('/login', authLimiter, validateLogin, login);
/**
 * POST /api/v1/auth/refresh
 * Renueva un access token usando un refresh token
 *
 * Body:
 * - refreshToken: string (no vacío)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: {
 *     accessToken: string,
 *     expiresIn: number
 *   },
 *   message: "Token renovado exitosamente"
 * }
 */
authRouter.post('/refresh', validateRefreshToken, refresh);
/**
 * POST /api/v1/auth/logout
 * Revoca un refresh token (logout)
 *
 * Body:
 * - refreshToken: string (no vacío)
 *
 * Respuesta 204: No Content
 */
authRouter.post('/logout', validateRefreshToken, logout);
/**
 * GET /api/v1/auth/me
 * Obtiene información del usuario autenticado
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: {
 *     userId: string,
 *     email: string
 *   },
 *   message: "Token válido"
 * }
 */
authRouter.get('/me', authenticate, me);
export default authRouter;
//# sourceMappingURL=auth.routes.js.map