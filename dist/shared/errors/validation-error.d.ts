import { AppError } from './app-error.js';
/**
 * Error para validaciones de reglas de negocio
 *
 * Uso: Cuando una validación de negocio falla
 * Ejemplo: "No tienes un permiso vigente para esta actividad"
 */
export declare class ValidationError extends AppError {
    constructor(message: string, field?: string, details?: Record<string, unknown>);
}
//# sourceMappingURL=validation-error.d.ts.map