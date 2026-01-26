import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UpdateProfileSchema, ChangePasswordSchema } from '../validators/user.validator.js';

/**
 * Middleware de validación para actualizar perfil de usuario
 *
 * Valida el body de la request usando UpdateProfileSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateUpdateProfile = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Validar y transformar el body usando el schema Zod
    req.body = UpdateProfileSchema.parse(req.body);
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
 * Middleware de validación para cambiar contraseña
 *
 * Valida el body de la request usando ChangePasswordSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateChangePassword = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Validar y transformar el body usando el schema Zod
    req.body = ChangePasswordSchema.parse(req.body);
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
