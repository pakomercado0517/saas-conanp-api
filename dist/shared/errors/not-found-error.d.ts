import { AppError } from './app-error.js';
/**
 * Error para recursos no encontrados
 *
 * Uso: Cuando un recurso no existe en la base de datos
 * Ejemplo: "Actividad no encontrada"
 */
export declare class NotFoundError extends AppError {
    constructor(resource: string, details?: Record<string, unknown>);
}
//# sourceMappingURL=not-found-error.d.ts.map