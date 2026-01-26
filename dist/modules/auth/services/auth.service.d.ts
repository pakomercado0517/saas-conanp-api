import type { RegisterDTO, LoginDTO } from '../validators/auth.validator.js';
import type { AuthResponse, RefreshTokenResponse, JWTPayload } from '../types/auth.types.js';
import type { UUID } from '../../../shared/database/types.js';
/**
 * Registra un nuevo usuario
 */
export declare const register: (data: RegisterDTO) => Promise<AuthResponse>;
/**
 * Inicia sesión con email y contraseña
 */
export declare const login: (data: LoginDTO) => Promise<AuthResponse>;
/**
 * Valida un access token JWT
 */
export declare const validateToken: (token: string) => JWTPayload;
/**
 * Renueva un access token usando un refresh token
 */
export declare const refreshAccessToken: (refreshToken: string) => Promise<RefreshTokenResponse>;
/**
 * Revoca un refresh token
 */
export declare const revokeRefreshToken: (refreshToken: string) => Promise<void>;
/**
 * Revoca todos los refresh tokens de un usuario
 */
export declare const revokeAllUserRefreshTokens: (userId: UUID) => Promise<void>;
//# sourceMappingURL=auth.service.d.ts.map