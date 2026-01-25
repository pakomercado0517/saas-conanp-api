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
const formatZodError = (error: z.ZodError) => {
  const detalles = error.issues.map((err) => ({
    campo: err.path.join('.') || 'raíz',
    mensaje: err.message,
    codigo: err.code,
    ...(err.path.length > 0 && { valor: err.path }),
  }));

  return {
    success: false,
    error: 'Error de validación',
    message: 'Los datos proporcionados no son válidos',
    code: 'VALIDATION_ERROR',
    detalles,
  };
};

/**
 * Formatea errores de Sequelize para respuesta API
 * 
 * Maneja diferentes tipos de errores de Sequelize:
 * - ValidationError: errores de validación de campos
 * - UniqueConstraintError: violaciones de unicidad
 * - ForeignKeyConstraintError: violaciones de claves foráneas
 */
const formatSequelizeError = (error: any) => {
  // ValidationError de Sequelize
  if (error.name === 'SequelizeValidationError') {
    const detalles = error.errors.map((err: any) => ({
      campo: err.path || 'campo',
      mensaje: err.message,
      valor: err.value,
      tipo: err.type,
    }));

    return {
      success: false,
      error: 'Error de validación',
      message: 'Los datos proporcionados no son válidos',
      code: 'VALIDATION_ERROR',
      detalles,
    };
  }

  // UniqueConstraintError - Campo duplicado
  if (error.name === 'SequelizeUniqueConstraintError') {
    const campo = error.errors[0]?.path || 'campo';
    const valor = error.errors[0]?.value;

    return {
      success: false,
      error: 'Conflicto',
      message: `El ${campo} ya existe${valor ? `: ${valor}` : ''}`,
      code: 'CONFLICT',
      details: {
        campo,
        ...(valor && { valor }),
      },
    };
  }

  // ForeignKeyConstraintError - Referencia inválida
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    const campo = error.fields?.[0] || 'referencia';
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
  if (error.name === 'SequelizeDatabaseError') {
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
 * Formatea errores de JWT para respuesta API
 * 
 * Maneja errores relacionados con tokens JWT:
 * - JsonWebTokenError: token inválido
 * - TokenExpiredError: token expirado
 */
const formatJWTError = (error: any) => {
  if (error.name === 'JsonWebTokenError') {
    return {
      success: false,
      error: 'Token inválido',
      message: 'El token de autenticación no es válido',
      code: 'UNAUTHORIZED',
    };
  }

  if (error.name === 'TokenExpiredError') {
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
