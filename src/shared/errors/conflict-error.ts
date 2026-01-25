import { AppError } from './app-error.js';

/**
 * Error para conflictos de estado o duplicados
 *
 * Uso: Cuando hay un conflicto (email duplicado, estado inválido, etc.)
 * Ejemplo: "El email ya está registrado", "El bloque ya está ocupado"
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 409, 'CONFLICT', details);
    this.name = 'ConflictError';
  }
}
