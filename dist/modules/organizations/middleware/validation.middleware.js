import { z } from 'zod';
import { CreateOrganizationSchema, UpdateOrganizationSchema, ListOrganizationsSchema, } from '../validators/organization.validator.js';
/**
 * Middleware de validación para crear organización
 *
 * Valida el body de la request usando CreateOrganizationSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 */
export const validateCreateOrganization = (req, res, next) => {
    try {
        req.body = CreateOrganizationSchema.parse(req.body);
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
        next(error);
    }
};
/**
 * Middleware de validación para actualizar organización
 *
 * Valida el body de la request usando UpdateOrganizationSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 */
export const validateUpdateOrganization = (req, res, next) => {
    try {
        req.body = UpdateOrganizationSchema.parse(req.body);
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
        next(error);
    }
};
/**
 * Middleware de validación para listar organizaciones
 *
 * Valida los query params usando ListOrganizationsSchema de Zod.
 * Si la validación es exitosa, actualiza req.query con los datos validados (coerción, defaults).
 * Si falla, retorna un error 400 con los detalles de validación en español.
 */
export const validateListOrganizations = (req, res, next) => {
    try {
        req.validatedQuery = ListOrganizationsSchema.parse(req.query);
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
        next(error);
    }
};
//# sourceMappingURL=validation.middleware.js.map