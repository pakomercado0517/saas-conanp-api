import type { RegisterDTO, LoginDTO } from '../validators/auth.validator.js';
import type { AuthResponseWithRefreshCookie, RegisterResponse, RefreshTokenResponse, JWTPayload } from '../types/auth.types.js';
import type { UUID } from '../../../shared/database/types.js';
/** Nombre de la cookie donde se envía el refresh token */
export declare const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";
/**
 * Opciones para la cookie del refresh token (httpOnly, Secure, SameSite).
 * Usado en login/refresh para setear y en logout para clearCookie con las mismas opciones.
 */
export declare const getRefreshTokenCookieOptions: () => {
    httpOnly: true;
    secure: boolean;
    sameSite: "strict";
    path: string;
    maxAge: number;
};
export declare const register: (data: RegisterDTO) => Promise<RegisterResponse>;
/**
 * Inicia sesión con email y contraseña
 */
export declare const login: (data: LoginDTO) => Promise<AuthResponseWithRefreshCookie>;
/**
 * Valida un access token JWT
 */
export declare const validateToken: (token: string) => JWTPayload;
/**
 * Renueva un access token usando un refresh token (lookup O(1) por tokenId)
 */
export declare const refreshAccessToken: (refreshToken: string) => Promise<RefreshTokenResponse>;
/**
 * Revoca un refresh token (lookup O(1) por tokenId)
 */
export declare const revokeRefreshToken: (refreshToken: string) => Promise<void>;
/**
 * Verifica el correo electrónico del usuario usando el token
 */
export declare const verifyEmail: (token: string) => Promise<void>;
/**
 * Reenvía el email de verificación
 */
export declare const resendVerificationEmail: (email: string) => Promise<void>;
/**
 * Envía email de recuperación de contraseña.
 * Por seguridad, no revela si el email existe o no.
 */
export declare const forgotPassword: (email: string) => Promise<void>;
/**
 * Restablece la contraseña usando el token enviado por email.
 */
export declare const resetPassword: (token: string, newPassword: string) => Promise<void>;
/**
 * Revoca todos los refresh tokens de un usuario
 */
export declare const revokeAllUserRefreshTokens: (userId: UUID) => Promise<void>;
//# sourceMappingURL=auth.service.d.ts.map