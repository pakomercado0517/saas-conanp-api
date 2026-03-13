import * as authService from '../services/auth.service.js';
import { getRefreshTokenCookieOptions, REFRESH_TOKEN_COOKIE_NAME, } from '../services/auth.service.js';
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
 * El refresh token se envía en cookie httpOnly; el body solo incluye user, accessToken y expiresIn.
 *
 * POST /api/v1/auth/login
 */
export const login = async (req, res) => {
    const data = req.body;
    const result = await authService.login(data);
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result._refreshTokenPlain, {
        ...getRefreshTokenCookieOptions(),
    });
    const { _refreshTokenPlain: _, ...publicResult } = result;
    return sendSuccess(res, publicResult, 'Inicio de sesión exitoso');
};
/**
 * Renueva un access token usando el refresh token enviado en cookie httpOnly
 *
 * POST /api/v1/auth/refresh
 */
export const refresh = async (req, res) => {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
    const result = await authService.refreshAccessToken(refreshToken ?? '');
    return sendSuccess(res, result, 'Token renovado exitosamente');
};
/**
 * Revoca el refresh token (logout) y limpia la cookie
 *
 * POST /api/v1/auth/logout
 */
export const logout = async (req, res) => {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
    if (refreshToken) {
        await authService.revokeRefreshToken(refreshToken);
    }
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getRefreshTokenCookieOptions());
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
 * Solicita envío de email de recuperación de contraseña
 *
 * POST /api/v1/auth/forgot-password
 */
export const forgotPassword = async (req, res) => {
    const data = req.body;
    await authService.forgotPassword(data.email);
    // Siempre retornar éxito (por seguridad, no revelar si el email existe)
    return sendSuccess(res, { sent: true }, 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña');
};
/**
 * Restablece la contraseña usando el token del email
 *
 * POST /api/v1/auth/reset-password
 */
export const resetPassword = async (req, res) => {
    const data = req.body;
    await authService.resetPassword(data.token, data.newPassword);
    return sendSuccess(res, { reset: true }, 'Contraseña restablecida exitosamente');
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