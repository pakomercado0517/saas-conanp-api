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
 * Respuesta de autenticación (login/registro)
 */
export interface AuthResponse {
    user: {
        id: UUID;
        email: string;
        name: string;
    };
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
/**
 * Respuesta de refresh token
 */
export interface RefreshTokenResponse {
    accessToken: string;
    expiresIn: number;
}
//# sourceMappingURL=auth.types.d.ts.map