import { AppError } from './app-error.js';
/**
 * Error para solicitudes mal formadas
 *
 * Uso: Cuando la solicitud tiene un formato incorrecto o falta información requerida
 * Diferencia con ValidationError: BadRequest = formato/estructura, Validation = reglas de negocio
 * Ejemplo: "Formato de fecha inválido", "Faltan parámetros requeridos"
 */
export declare class BadRequestError extends AppError {
    constructor(message: string, details?: Record<string, unknown>);
}
//# sourceMappingURL=bad-request-error.d.ts.map