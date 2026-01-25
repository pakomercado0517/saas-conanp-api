import { AppError } from './app-error.js';

/**
 * Error para recursos no encontrados
 *
 * Uso: Cuando un recurso no existe en la base de datos
 * Ejemplo: "Actividad no encontrada"
 */
export class NotFoundError extends AppError {
  constructor(resource: string, details?: Record<string, unknown>) {
    super(
      `${resource} no encontrado${resource.endsWith('a') ? 'a' : resource.endsWith('o') ? 'o' : ''}`,
      404,
      'NOT_FOUND',
      details
    );
    this.name = 'NotFoundError';
  }
}
