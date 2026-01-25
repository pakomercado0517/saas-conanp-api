/**
 * Clase base abstracta para todos los errores personalizados de la aplicación
 *
 * Proporciona una estructura consistente para manejo de errores con:
 * - Código HTTP apropiado
 * - Código de error interno para el frontend
 * - Mensaje en español
 * - Detalles opcionales
 */
export class AppError extends Error {
    name;
    statusCode;
    code;
    details;
    constructor(message, statusCode, code, details) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        if (details !== undefined) {
            this.details = details;
        }
        // Mantener el stack trace correcto
        Error.captureStackTrace(this, this.constructor);
    }
    /**
     * Formatea el error para la respuesta API
     */
    toJSON() {
        return {
            success: false,
            error: this.name,
            message: this.message,
            code: this.code,
            ...(this.details && { details: this.details }),
        };
    }
}
//# sourceMappingURL=app-error.js.map