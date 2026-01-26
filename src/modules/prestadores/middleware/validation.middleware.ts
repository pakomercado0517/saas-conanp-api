import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  CreatePrestadorProfileSchema,
  UpdatePrestadorProfileSchema,
  ListPrestadoresSchema,
} from '../validators/prestador-profile.validator.js';

/**
 * Middleware de validación para crear perfil de prestador
 *
 * Valida el body de la request usando CreatePrestadorProfileSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateCreatePrestadorProfile = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Validar y transformar el body usando el schema Zod
    req.body = CreatePrestadorProfileSchema.parse(req.body);
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
 * Middleware de validación para actualizar perfil de prestador
 *
 * Valida el body de la request usando UpdatePrestadorProfileSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateUpdatePrestadorProfile = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Validar y transformar el body usando el schema Zod
    req.body = UpdatePrestadorProfileSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const detalles = error.issues.map((err) => ({
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
 * Middleware de validación para listar prestadores
 *
 * Valida los query params usando ListPrestadoresSchema de Zod.
 * Si la validación es exitosa, actualiza req.validatedQuery con los datos validados (coerción, defaults).
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateListPrestadores = (req: Request, res: Response, next: NextFunction): void => {
  try {
    req.validatedQuery = ListPrestadoresSchema.parse(req.query);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const detalles = error.issues.map((err) => ({
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
