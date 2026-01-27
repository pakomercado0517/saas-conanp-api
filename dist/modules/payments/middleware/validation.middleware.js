import { z } from 'zod';
import { CreatePaymentIntentSchema, ConfirmPaymentSchema, ListPaymentsSchema, ProcessRefundSchema, } from '../validators/payment.validator.js';
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
export const validateCreatePaymentIntent = (req, res, next) => {
    try {
        // Validar y transformar el body usando el schema Zod
        req.body = CreatePaymentIntentSchema.parse(req.body);
        next();
    }
    catch (error) {
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
export const validateConfirmPayment = (req, res, next) => {
    try {
        // Validar y transformar el body usando el schema Zod
        req.body = ConfirmPaymentSchema.parse(req.body);
        next();
    }
    catch (error) {
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
export const validateListPayments = (req, res, next) => {
    try {
        // Validar y transformar los query params usando el schema Zod
        req.validatedQuery = ListPaymentsSchema.parse(req.query);
        next();
    }
    catch (error) {
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
export const validateProcessRefund = (req, res, next) => {
    try {
        // Validar y transformar el body usando el schema Zod
        req.body = ProcessRefundSchema.parse(req.body);
        next();
    }
    catch (error) {
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
//# sourceMappingURL=validation.middleware.js.map