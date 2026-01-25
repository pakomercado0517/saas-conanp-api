import { AppError } from './app-error.js';

/**
 * Error para operaciones prohibidas
 * 
 * Uso: Cuando el usuario está autenticado pero no tiene permisos
 * Diferencia con UnauthorizedError: 401 = no autenticado, 403 = sin permisos
 * Ejemplo: "No tienes permisos para realizar esta acción"
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'No tienes permisos para realizar esta acción', details?: Record<string, unknown>) {
    super(message, 403, 'FORBIDDEN', details);
    this.name = 'ForbiddenError';
  }
}
