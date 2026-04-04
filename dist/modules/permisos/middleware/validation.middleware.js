import { z } from 'zod';
import { CreatePermisoSchema, UpdatePermisoSchema, ListPermisosSchema, ListPrestadoresConPermisosPorAreaSchema, } from '../validators/permiso.validator.js';
/**
 * Middleware de validación para crear permiso
 *
 * Valida el body de la request usando CreatePermisoSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateCreatePermiso = (req, res, next) => {
    try {
        // Validar y transformar el body usando el schema Zod
        req.body = CreatePermisoSchema.parse(req.body);
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
 * Middleware de validación para actualizar permiso
 *
 * Valida el body de la request usando UpdatePermisoSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateUpdatePermiso = (req, res, next) => {
    try {
        // Validar y transformar el body usando el schema Zod
        req.body = UpdatePermisoSchema.parse(req.body);
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
 * Middleware de validación para listar permisos
 *
 * Valida los query params de la request usando ListPermisosSchema de Zod.
 * Si la validación es exitosa, actualiza req.validatedQuery con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateListPermisos = (req, res, next) => {
    try {
        // Validar y transformar los query params usando el schema Zod
        req.validatedQuery = ListPermisosSchema.parse(req.query);
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
 * Valida query params para GET .../prestadores/con-permisos (agrupado por prestador).
 */
export const validateListPrestadoresConPermisosPorArea = (req, res, next) => {
    try {
        req.validatedQuery = ListPrestadoresConPermisosPorAreaSchema.parse(req.query);
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