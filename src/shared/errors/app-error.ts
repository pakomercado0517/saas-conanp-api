/**
 * Clase base abstracta para todos los errores personalizados de la aplicación
 * 
 * Proporciona una estructura consistente para manejo de errores con:
 * - Código HTTP apropiado
 * - Código de error interno para el frontend
 * - Mensaje en español
 * - Detalles opcionales
 */
export abstract class AppError extends Error {
  public override name: string;
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: Record<string, unknown>
  ) {
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
  toJSON(): {
    success: false;
    error: string;
    message: string;
    code: string;
    details?: Record<string, unknown>;
  } {
    return {
      success: false,
      error: this.name,
      message: this.message,
      code: this.code,
      ...(this.details && { details: this.details }),
    };
  }
}
