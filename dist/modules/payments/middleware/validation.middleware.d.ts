import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware de validación para crear Payment Intent
 *
 * Valida el body de la request usando CreatePaymentIntentSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateCreatePaymentIntent: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para confirmar pago
 *
 * Valida el body de la request usando ConfirmPaymentSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateConfirmPayment: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para listar pagos
 *
 * Valida los query params de la request usando ListPaymentsSchema de Zod.
 * Si la validación es exitosa, actualiza req.validatedQuery con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateListPayments: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware de validación para procesar reembolso
 *
 * Valida el body de la request usando ProcessRefundSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const validateProcessRefund: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map