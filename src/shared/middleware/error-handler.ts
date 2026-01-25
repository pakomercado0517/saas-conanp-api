import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../logger/index.js';
import { AppError } from '../errors/index.js';

/**
 * Interfaz para contexto de request extendido
 */
interface RequestContext extends Request {
  user?: {
    id: string;
    email?: string;
  };
  organizationId?: string;
}

/**
 * Formatea errores de Zod para respuesta API
 *
 * Convierte los errores de Zod en un formato estructurado con mensajes en español
 */
const formatZodError = (
  error: z.ZodError
): {
  success: false;
  error: string;
  message: string;
  code: string;
  detalles: Array<{
    campo: string;
    mensaje: string;
    codigo: string;
    valor?: unknown;
  }>;
} => {
  const detalles = error.issues.map((err) => {
    const detalle: {
      campo: string;
      mensaje: string;
      codigo: string;
      valor?: unknown;
    } = {
      campo: err.path.join('.') || 'raíz',
      mensaje: err.message,
      codigo: err.code,
    };

    if (err.path.length > 0) {
      detalle.valor = err.path;
    }

    return detalle;
  });

  return {
    success: false,
    error: 'Error de validación',
    message: 'Los datos proporcionados no son válidos',
    code: 'VALIDATION_ERROR',
    detalles,
  };
};

/**
 * Interfaz para errores de validación de Sequelize
 */
interface SequelizeValidationErrorItem {
  path?: string;
  message: string;
  value?: unknown;
  type?: string;
}

/**
 * Interfaz para errores de Sequelize
 */
interface SequelizeError extends Error {
  name: string;
  errors?: SequelizeValidationErrorItem[];
  fields?: string[];
}

/**
 * Formatea errores de Sequelize para respuesta API
 *
 * Maneja diferentes tipos de errores de Sequelize:
 * - ValidationError: errores de validación de campos
 * - UniqueConstraintError: violaciones de unicidad
 * - ForeignKeyConstraintError: violaciones de claves foráneas
 */
const formatSequelizeError = (
  error: unknown
): {
  success: false;
  error: string;
  message: string;
  code: string;
  detalles?: Array<{
    campo: string;
    mensaje: string;
    valor?: unknown;
    tipo?: string;
  }>;
  details?: {
    campo: string;
    valor?: unknown;
  };
} | null => {
  if (!(error instanceof Error)) {
    return null;
  }

  const sequelizeError = error as SequelizeError;

  // ValidationError de Sequelize
  if (sequelizeError.name === 'SequelizeValidationError' && sequelizeError.errors) {
    const detalles = sequelizeError.errors.map((err: SequelizeValidationErrorItem) => {
      const detalle: {
        campo: string;
        mensaje: string;
        valor?: unknown;
        tipo?: string;
      } = {
        campo: err.path || 'campo',
        mensaje: err.message,
      };

      if (err.value !== undefined) {
        detalle.valor = err.value;
      }

      if (err.type !== undefined) {
        detalle.tipo = err.type;
      }

      return detalle;
    });

    return {
      success: false,
      error: 'Error de validación',
      message: 'Los datos proporcionados no son válidos',
      code: 'VALIDATION_ERROR',
      detalles,
    };
  }

  // UniqueConstraintError - Campo duplicado
  if (sequelizeError.name === 'SequelizeUniqueConstraintError' && sequelizeError.errors) {
    const campo = sequelizeError.errors[0]?.path || 'campo';
    const valor = sequelizeError.errors[0]?.value;

    const details: {
      campo: string;
      valor?: unknown;
    } = {
      campo,
    };

    if (valor !== undefined) {
      details.valor = valor;
    }

    return {
      success: false,
      error: 'Conflicto',
      message: `El ${campo} ya existe${valor !== undefined ? `: ${valor}` : ''}`,
      code: 'CONFLICT',
      details,
    };
  }

  // ForeignKeyConstraintError - Referencia inválida
  if (sequelizeError.name === 'SequelizeForeignKeyConstraintError') {
    const campo = sequelizeError.fields?.[0] || 'referencia';
    return {
      success: false,
      error: 'Error de referencia',
      message: `La referencia proporcionada en ${campo} no es válida`,
      code: 'BAD_REQUEST',
      details: {
        campo,
      },
    };
  }

  // DatabaseError - Errores de base de datos
  if (sequelizeError.name === 'SequelizeDatabaseError') {
    return {
      success: false,
      error: 'Error de base de datos',
      message: 'Ocurrió un error al procesar la solicitud',
      code: 'DATABASE_ERROR',
    };
  }

  return null;
};

/**
 * Interfaz para errores de JWT
 */
interface JWTError extends Error {
  name: string;
}

/**
 * Formatea errores de JWT para respuesta API
 *
 * Maneja errores relacionados con tokens JWT:
 * - JsonWebTokenError: token inválido
 * - TokenExpiredError: token expirado
 */
const formatJWTError = (
  error: unknown
): {
  success: false;
  error: string;
  message: string;
  code: string;
} | null => {
  if (!(error instanceof Error)) {
    return null;
  }

  const jwtError = error as JWTError;
  if (jwtError.name === 'JsonWebTokenError') {
    return {
      success: false,
      error: 'Token inválido',
      message: 'El token de autenticación no es válido',
      code: 'UNAUTHORIZED',
    };
  }

  if (jwtError.name === 'TokenExpiredError') {
    return {
      success: false,
      error: 'Token expirado',
      message: 'El token de autenticación ha expirado. Por favor inicia sesión nuevamente',
      code: 'UNAUTHORIZED',
    };
  }

  return null;
};

/**
 * Middleware de manejo de errores globales
 *
 * Este middleware debe ser el último middleware registrado en la aplicación.
 * Captura todos los errores no manejados y los formatea de manera consistente.
 *
 * @param err - Error capturado
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express (no se usa, pero es requerido por Express)
 */
export const errorHandler = (
  err: unknown,
  req: RequestContext,
  res: Response,
  _next: NextFunction
): Response | void => {
  const isDevelopment = process.env['NODE_ENV'] !== 'production';

  // Extraer contexto de la request para logging
  const context = {
    path: req.path,
    method: req.method,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
    organizationId: req.organizationId,
    timestamp: new Date().toISOString(),
  };

  // 1. Error no es instancia de Error
  if (!(err instanceof Error)) {
    logger.error(
      {
        ...context,
        error: 'Error desconocido sin instancia de Error',
        errorData: err,
      },
      'Error interno del servidor - Tipo desconocido'
    );

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'Ocurrió un error inesperado. Por favor intenta nuevamente más tarde.',
      code: 'INTERNAL_SERVER_ERROR',
    });
    return;
  }

  // 2. AppError (errores personalizados de la aplicación)
  if (err instanceof AppError) {
    const errorResponse = err.toJSON();

    // Determinar nivel de log según el código de estado
    const logLevel = err.statusCode >= 500 ? 'error' : 'warn';

    logger[logLevel](
      {
        ...context,
        error: err,
        statusCode: err.statusCode,
        code: errorResponse.code,
        ...(isDevelopment && { stack: err.stack }),
      },
      `Error de aplicación: ${errorResponse.code}`
    );

    res.status(err.statusCode).json({
      ...errorResponse,
      ...(isDevelopment && { stack: err.stack }),
    });
    return;
  }

  // 3. ZodError - Errores de validación con Zod
  if (err instanceof z.ZodError) {
    const errorResponse = formatZodError(err);

    logger.warn(
      {
        ...context,
        error: err,
        detalles: errorResponse.detalles,
        ...(isDevelopment && { stack: err.stack }),
      },
      'Error de validación Zod'
    );

    res.status(400).json({
      ...errorResponse,
      ...(isDevelopment && { stack: err.stack }),
    });
    return;
  }

  // 4. Sequelize Errors - Errores de base de datos
  const sequelizeError = formatSequelizeError(err);
  if (sequelizeError) {
    const statusCode =
      sequelizeError.code === 'CONFLICT'
        ? 409
        : sequelizeError.code === 'DATABASE_ERROR'
          ? 500
          : 400;

    logger.warn(
      {
        ...context,
        error: err,
        sequelizeError: err.name,
        ...(isDevelopment && { stack: err.stack }),
      },
      `Error de Sequelize: ${err.name}`
    );

    res.status(statusCode).json({
      ...sequelizeError,
      ...(isDevelopment && { stack: err.stack }),
    });
    return;
  }

  // 5. JWT Errors - Errores de autenticación JWT
  const jwtError = formatJWTError(err);
  if (jwtError) {
    logger.warn(
      {
        ...context,
        error: err,
        jwtError: err.name,
        ...(isDevelopment && { stack: err.stack }),
      },
      `Error de JWT: ${err.name}`
    );

    res.status(401).json({
      ...jwtError,
      ...(isDevelopment && { stack: err.stack }),
    });
    return;
  }

  // 6. Errores desconocidos - Fallback para cualquier otro error
  logger.error(
    {
      ...context,
      error: err,
      name: err.name,
      message: err.message,
      ...(isDevelopment && { stack: err.stack }),
    },
    'Error interno del servidor - Error desconocido'
  );

  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: isDevelopment
      ? err.message
      : 'Ocurrió un error inesperado. Por favor intenta nuevamente más tarde.',
    code: 'INTERNAL_SERVER_ERROR',
    ...(isDevelopment && { stack: err.stack, name: err.name }),
  });
};
