import { AppError } from './app-error.js';
/**
 * Error para autenticación fallida
 *
 * Uso: Cuando el usuario no está autenticado o el token es inválido
 * Ejemplo: "Token de autenticación requerido", "Token inválido o expirado"
 */
export class UnauthorizedError extends AppError {
    constructor(message = 'No autorizado', details) {
        super(message, 401, 'UNAUTHORIZED', details);
        this.name = 'UnauthorizedError';
    }
}
//# sourceMappingURL=unauthorized-error.js.map