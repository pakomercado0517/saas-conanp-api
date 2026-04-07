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
/**
 * Middleware de validación para crear suscripción
 */
export declare const validateCreateSubscription: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para crear sesión Stripe Checkout (suscripción)
 */
export declare const validateCreateSubscriptionCheckoutSession: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para actualizar suscripción (cambio de plan)
 */
export declare const validateUpdateSubscription: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para cancelar suscripción
 */
export declare const validateCancelSubscription: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para reactivar suscripción (body vacío)
 */
export declare const validateReactivateSubscription: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map