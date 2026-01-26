import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  CreateEventoSchema,
  UpdateEventoSchema,
  ListEventosSchema,
} from '../validators/evento.validator.js';

/**
 * Middleware de validación para crear evento
 *
 * Valida el body de la request usando CreateEventoSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateCreateEvento = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Validar y transformar el body usando el schema Zod
    req.body = CreateEventoSchema.parse(req.body);
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
        message: 'Los datos proporcionados no son válidos',
        code: 'VALIDATION_ERROR',
        detalles,
      });
      return;
    }

    // Si no es un error de Zod, pasarlo al siguiente middleware de errores
    next(error);
  }
};

/**
 * Middleware de validación para actualizar evento
 *
 * Valida el body de la request usando UpdateEventoSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateUpdateEvento = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Validar y transformar el body usando el schema Zod
    req.body = UpdateEventoSchema.parse(req.body);
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
        message: 'Los datos proporcionados no son válidos',
        code: 'VALIDATION_ERROR',
        detalles,
      });
      return;
    }

    // Si no es un error de Zod, pasarlo al siguiente middleware de errores
    next(error);
  }
};

/**
 * Middleware de validación para listar eventos
 *
 * Valida los query params de la request usando ListEventosSchema de Zod.
 * Si la validación es exitosa, actualiza req.validatedQuery con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateListEventos = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Validar y transformar los query params usando el schema Zod
    req.validatedQuery = ListEventosSchema.parse(req.query);
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
        message: 'Los datos proporcionados no son válidos',
        code: 'VALIDATION_ERROR',
        detalles,
      });
      return;
    }

    // Si no es un error de Zod, pasarlo al siguiente middleware de errores
    next(error);
  }
};
