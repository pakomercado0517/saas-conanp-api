import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware de validación para crear plan de suscripción
 */
export declare const validateCreateSubscriptionPlan: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para actualizar plan de suscripción
 */
export declare const validateUpdateSubscriptionPlan: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para listar planes de suscripción
 */
export declare const validateListSubscriptionPlans: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map