import * as authService from '../services/auth.service.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../../shared/responses/helpers.js';
/**
 * Registra un nuevo usuario
 *
 * POST /api/v1/auth/register
 */
export const register = async (req, res) => {
    const data = req.body;
    const result = await authService.register(data);
    return sendCreated(res, result, 'Usuario registrado exitosamente');
};
/**
 * Inicia sesión con email y contraseña
 *
 * POST /api/v1/auth/login
 */
export const login = async (req, res) => {
    const data = req.body;
    const result = await authService.login(data);
    return sendSuccess(res, result, 'Inicio de sesión exitoso');
};
/**
 * Renueva un access token usando un refresh token
 *
 * POST /api/v1/auth/refresh
 */
export const refresh = async (req, res) => {
    const data = req.body;
    const result = await authService.refreshAccessToken(data.refreshToken);
    return sendSuccess(res, result, 'Token renovado exitosamente');
};
/**
 * Revoca un refresh token (logout)
 *
 * POST /api/v1/auth/logout
 */
export const logout = async (req, res) => {
    const data = req.body;
    await authService.revokeRefreshToken(data.refreshToken);
    return sendNoContent(res);
};
/**
 * Verifica el correo electrónico con el token
 *
 * GET /api/v1/auth/verify-email?token=
 */
export const verifyEmail = async (req, res) => {
    const token = req.query['token'];
    await authService.verifyEmail(token ?? '');
    return sendSuccess(res, { verified: true }, 'Correo electrónico verificado exitosamente');
};
/**
 * Reenvía el email de verificación
 *
 * POST /api/v1/auth/resend-verification
 */
export const resendVerification = async (req, res) => {
    const data = req.body;
    await authService.resendVerificationEmail(data.email);
    // Siempre retornar éxito (por seguridad, no revelar si el email existe)
    return sendSuccess(res, { sent: true }, 'Si el correo está registrado y no verificado, recibirás un nuevo enlace de verificación');
};
/**
 * Valida el token actual y retorna información del usuario autenticado
 *
 * GET /api/v1/auth/me
 */
export const me = async (req, res) => {
    // El token ya fue validado por el middleware de autenticación
    // req.user contiene el payload del JWT (userId, email)
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    return sendSuccess(res, {
        userId: req.user.userId,
        email: req.user.email,
    }, 'Token válido');
};
//# sourceMappingURL=auth.controller.js.map