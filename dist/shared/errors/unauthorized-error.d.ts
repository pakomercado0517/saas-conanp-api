import { AppError } from './app-error.js';
/**
 * Error para autenticación fallida
 *
 * Uso: Cuando el usuario no está autenticado o el token es inválido
 * Ejemplo: "Token de autenticación requerido", "Token inválido o expirado"
 */
export declare class UnauthorizedError extends AppError {
    constructor(message?: string, details?: Record<string, unknown>);
}
//# sourceMappingURL=unauthorized-error.d.ts.map