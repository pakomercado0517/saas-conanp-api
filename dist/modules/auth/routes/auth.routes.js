import { Router } from 'express';
import { register, login, refresh, logout, me, verifyEmail, resendVerification, forgotPassword, resetPassword, } from '../controllers/auth.controller.js';
import { validateRegister, validateLogin, validateRefreshToken, validateResendVerification, validateForgotPassword, validateResetPassword, } from '../middleware/validation.middleware.js';
import { authenticate, authLimiter, forgotPasswordLimiter, resendVerificationLimiter, } from '@/shared/middleware/index.js';
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
 *     message: "Revisa tu correo electrónico para verificar tu cuenta"
 *   },
 *   message: "Usuario registrado exitosamente"
 * }
 *
 * Nota: El usuario debe verificar su correo antes de poder iniciar sesión.
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
 * GET /api/v1/auth/verify-email
 * Verifica el correo electrónico con el token enviado por email
 *
 * Query:
 * - token: string (token de verificación)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: { verified: true },
 *   message: "Correo electrónico verificado exitosamente"
 * }
 */
authRouter.get('/verify-email', verifyEmail);
/**
 * POST /api/v1/auth/resend-verification
 * Reenvía el email de verificación
 *
 * Body:
 * - email: string (email válido)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: { sent: true },
 *   message: "Si el correo está registrado y no verificado, recibirás un nuevo enlace..."
 * }
 */
authRouter.post('/resend-verification', resendVerificationLimiter, validateResendVerification, resendVerification);
/**
 * POST /api/v1/auth/forgot-password
 * Solicita envío de email para recuperación de contraseña
 *
 * Body:
 * - email: string (email válido)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: { sent: true },
 *   message: "Si el correo está registrado, recibirás un enlace..."
 * }
 */
authRouter.post('/forgot-password', forgotPasswordLimiter, validateForgotPassword, forgotPassword);
/**
 * POST /api/v1/auth/reset-password
 * Restablece la contraseña usando el token del email
 *
 * Body:
 * - token: string (token recibido por email)
 * - newPassword: string (mínimo 8 caracteres)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: { reset: true },
 *   message: "Contraseña restablecida exitosamente"
 * }
 */
authRouter.post('/reset-password', validateResetPassword, resetPassword);
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