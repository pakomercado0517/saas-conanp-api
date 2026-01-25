import { AppError } from './app-error.js';
/**
 * Error para validaciones de reglas de negocio
 *
 * Uso: Cuando una validación de negocio falla
 * Ejemplo: "No tienes un permiso vigente para esta actividad"
 */
export class ValidationError extends AppError {
    constructor(message, field, details) {
        super(message, 400, 'VALIDATION_ERROR', field ? { field, ...details } : details);
        this.name = 'ValidationError';
    }
}
//# sourceMappingURL=validation-error.js.map