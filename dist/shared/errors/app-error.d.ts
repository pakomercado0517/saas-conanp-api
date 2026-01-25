/**
 * Clase base abstracta para todos los errores personalizados de la aplicación
 *
 * Proporciona una estructura consistente para manejo de errores con:
 * - Código HTTP apropiado
 * - Código de error interno para el frontend
 * - Mensaje en español
 * - Detalles opcionales
 */
export declare abstract class AppError extends Error {
    name: string;
    readonly statusCode: number;
    readonly code: string;
    readonly details?: Record<string, unknown>;
    constructor(message: string, statusCode: number, code: string, details?: Record<string, unknown>);
    /**
     * Formatea el error para la respuesta API
     */
    toJSON(): {
        success: false;
        error: string;
        message: string;
        code: string;
        details?: Record<string, unknown>;
    };
}
//# sourceMappingURL=app-error.d.ts.map