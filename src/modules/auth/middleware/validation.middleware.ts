import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { REFRESH_TOKEN_COOKIE_NAME } from '../services/auth.service.js';
import {
  RegisterSchema,
  LoginSchema,
  ResendVerificationSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from '../validators/auth.validator.js';

/**
 * Middleware de validación para registro de usuario
 *
 * Valida el body de la request usando RegisterSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Validar y transformar el body usando el schema Zod
    req.body = RegisterSchema.parse(req.body);
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
 * Middleware de validación para login de usuario
 *
 * Valida el body de la request usando LoginSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Validar y transformar el body usando el schema Zod
    req.body = LoginSchema.parse(req.body);
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
 * Middleware de validación para refresh token (cookie httpOnly)
 *
 * Valida que la cookie refresh_token esté presente y no vacía.
 * Usado en POST /refresh y POST /logout.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateRefreshToken = (req: Request, res: Response, next: NextFunction): void => {
  const cookieValue = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
  if (typeof cookieValue !== 'string' || cookieValue.trim().length === 0) {
    res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Cookie de refresh token requerida. Inicia sesión de nuevo.',
      code: 'REFRESH_TOKEN_MISSING',
    });
    return;
  }
  next();
};

/**
 * Middleware de validación para reenviar verificación de email
 */
export const validateResendVerification = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.body = ResendVerificationSchema.parse(req.body);
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
    next(error);
  }
};

/**
 * Middleware de validación para solicitar recuperación de contraseña
 */
export const validateForgotPassword = (req: Request, res: Response, next: NextFunction): void => {
  try {
    req.body = ForgotPasswordSchema.parse(req.body);
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
    next(error);
  }
};

/**
 * Middleware de validación para restablecer contraseña
 */
export const validateResetPassword = (req: Request, res: Response, next: NextFunction): void => {
  try {
    req.body = ResetPasswordSchema.parse(req.body);
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
    next(error);
  }
};
