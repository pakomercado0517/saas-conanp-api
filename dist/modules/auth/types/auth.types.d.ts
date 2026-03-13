import type { UUID } from '../../../shared/database/types';
/**
 * Payload del JWT access token
 */
export interface JWTPayload {
    userId: UUID;
    email: string;
    type: 'access';
    iat?: number;
    exp?: number;
}
/**
 * Respuesta de autenticación (login) enviada al cliente.
 * El refresh token se envía en cookie httpOnly, no en el body.
 */
export interface AuthResponse {
    user: {
        id: UUID;
        email: string;
        name: string;
    };
    accessToken: string;
    expiresIn: number;
}
/**
 * Resultado interno de login: incluye el refresh token en texto plano
 * para que el controller lo setee en la cookie (no se serializa al cliente).
 */
export interface AuthResponseWithRefreshCookie extends AuthResponse {
    _refreshTokenPlain: string;
}
/**
 * Respuesta de registro (sin tokens hasta verificar email)
 */
export interface RegisterResponse {
    user: {
        id: UUID;
        email: string;
        name: string;
    };
    message: string;
}
/**
 * Respuesta de refresh token
 */
export interface RefreshTokenResponse {
    accessToken: string;
    expiresIn: number;
}
//# sourceMappingURL=auth.types.d.ts.map