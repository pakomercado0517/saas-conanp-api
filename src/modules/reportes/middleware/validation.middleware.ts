import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  ReporteEventosPorActividadSchema,
  ReporteEventosPorPrestadorSchema,
  ReporteEventosPorFechaSchema,
  ReporteCapacidadUtilizadaSchema,
  ReportePrestadoresActivosSchema,
} from '../validators/reporte.validator.js';

/**
 * Middleware de validación para reporte de eventos por actividad
 *
 * Valida los query params de la request usando ReporteEventosPorActividadSchema de Zod.
 * Si la validación es exitosa, actualiza req.validatedQuery con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateReporteEventosPorActividad = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.validatedQuery = ReporteEventosPorActividadSchema.parse(req.query);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const detalles = error.issues.map((err: z.ZodIssue) => ({
        campo: err.path.join('.') || 'raíz',
        mensaje: err.message,
        codigo: err.code,
      }));

      res.status(400).json({
        success: false,
        error: 'Error de validación',
        message: 'Los parámetros de consulta no son válidos',
        code: 'VALIDATION_ERROR',
        detalles,
      });
      return;
    }

    next(error);
  }
};

/**
 * Middleware de validación para reporte de eventos por prestador
 */
export const validateReporteEventosPorPrestador = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.validatedQuery = ReporteEventosPorPrestadorSchema.parse(req.query);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const detalles = error.issues.map((err: z.ZodIssue) => ({
        campo: err.path.join('.') || 'raíz',
        mensaje: err.message,
        codigo: err.code,
      }));

      res.status(400).json({
        success: false,
        error: 'Error de validación',
        message: 'Los parámetros de consulta no son válidos',
        code: 'VALIDATION_ERROR',
        detalles,
      });
      return;
    }

    next(error);
  }
};

/**
 * Middleware de validación para reporte de eventos por fecha
 */
export const validateReporteEventosPorFecha = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.validatedQuery = ReporteEventosPorFechaSchema.parse(req.query);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const detalles = error.issues.map((err: z.ZodIssue) => ({
        campo: err.path.join('.') || 'raíz',
        mensaje: err.message,
        codigo: err.code,
      }));

      res.status(400).json({
        success: false,
        error: 'Error de validación',
        message: 'Los parámetros de consulta no son válidos',
        code: 'VALIDATION_ERROR',
        detalles,
      });
      return;
    }

    next(error);
  }
};

/**
 * Middleware de validación para reporte de capacidad utilizada
 */
export const validateReporteCapacidadUtilizada = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.validatedQuery = ReporteCapacidadUtilizadaSchema.parse(req.query);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const detalles = error.issues.map((err: z.ZodIssue) => ({
        campo: err.path.join('.') || 'raíz',
        mensaje: err.message,
        codigo: err.code,
      }));

      res.status(400).json({
        success: false,
        error: 'Error de validación',
        message: 'Los parámetros de consulta no son válidos',
        code: 'VALIDATION_ERROR',
        detalles,
      });
      return;
    }

    next(error);
  }
};

/**
 * Middleware de validación para reporte de prestadores activos
 */
export const validateReportePrestadoresActivos = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.validatedQuery = ReportePrestadoresActivosSchema.parse(req.query);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const detalles = error.issues.map((err: z.ZodIssue) => ({
        campo: err.path.join('.') || 'raíz',
        mensaje: err.message,
        codigo: err.code,
      }));

      res.status(400).json({
        success: false,
        error: 'Error de validación',
        message: 'Los parámetros de consulta no son válidos',
        code: 'VALIDATION_ERROR',
        detalles,
      });
      return;
    }

    next(error);
  }
};
