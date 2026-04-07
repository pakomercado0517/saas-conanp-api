import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  CreateSubscriptionPlanSchema,
  UpdateSubscriptionPlanSchema,
  ListSubscriptionPlansSchema,
} from '../validators/subscription-plan.validator.js';
import {
  CreateSubscriptionSchema,
  CreateSubscriptionCheckoutSessionSchema,
  UpdateSubscriptionSchema,
  CancelSubscriptionSchema,
  ReactivateSubscriptionSchema,
} from '../validators/subscription.validator.js';

const handleZodError = (error: z.ZodError, res: Response): boolean => {
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
  return false;
};

/**
 * Middleware de validación para crear plan de suscripción
 */
export const validateCreateSubscriptionPlan = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.body = CreateSubscriptionPlanSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(error, res);
      return;
    }
    next(error);
  }
};

/**
 * Middleware de validación para actualizar plan de suscripción
 */
export const validateUpdateSubscriptionPlan = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.body = UpdateSubscriptionPlanSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(error, res);
      return;
    }
    next(error);
  }
};

/**
 * Middleware de validación para listar planes de suscripción
 */
export const validateListSubscriptionPlans = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.validatedQuery = ListSubscriptionPlansSchema.parse(req.query);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(error, res);
      return;
    }
    next(error);
  }
};

/**
 * Middleware de validación para crear suscripción
 */
export const validateCreateSubscription = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.body = CreateSubscriptionSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(error, res);
      return;
    }
    next(error);
  }
};

/**
 * Middleware de validación para crear sesión Stripe Checkout (suscripción)
 */
export const validateCreateSubscriptionCheckoutSession = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.body = CreateSubscriptionCheckoutSessionSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(error, res);
      return;
    }
    next(error);
  }
};

/**
 * Middleware de validación para actualizar suscripción (cambio de plan)
 */
export const validateUpdateSubscription = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.body = UpdateSubscriptionSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(error, res);
      return;
    }
    next(error);
  }
};

/**
 * Middleware de validación para cancelar suscripción
 */
export const validateCancelSubscription = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.body = CancelSubscriptionSchema.parse(req.body ?? {});
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(error, res);
      return;
    }
    next(error);
  }
};

/**
 * Middleware de validación para reactivar suscripción (body vacío)
 */
export const validateReactivateSubscription = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.body = ReactivateSubscriptionSchema.parse(req.body ?? {});
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleZodError(error, res);
      return;
    }
    next(error);
  }
};
