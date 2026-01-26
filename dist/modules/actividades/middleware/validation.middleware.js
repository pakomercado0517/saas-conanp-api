import { z } from 'zod';
import { CreateActividadSchema, UpdateActividadSchema, ListActividadesSchema, } from '../validators/actividad.validator.js';
import { CreateBloqueSchema, CreateBloqueFromTemplateSchema, UpdateBloqueSchema, ListBloquesSchema, } from '../validators/bloque.validator.js';
import { CreateCapacidadSchema, VerificarDisponibilidadSchema, } from '../validators/capacidad.validator.js';
/**
 * Middleware de validación para crear actividad
 *
 * Valida el body de la request usando CreateActividadSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateCreateActividad = (req, res, next) => {
    try {
        // Validar y transformar el body usando el schema Zod
        req.body = CreateActividadSchema.parse(req.body);
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
 * Middleware de validación para actualizar actividad
 *
 * Valida el body de la request usando UpdateActividadSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateUpdateActividad = (req, res, next) => {
    try {
        // Validar y transformar el body usando el schema Zod
        req.body = UpdateActividadSchema.parse(req.body);
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
 * Middleware de validación para listar actividades
 *
 * Valida los query params usando ListActividadesSchema de Zod.
 * Si la validación es exitosa, actualiza req.validatedQuery con los datos validados (coerción, defaults).
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateListActividades = (req, res, next) => {
    try {
        req.validatedQuery = ListActividadesSchema.parse(req.query);
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
 * Middleware de validación para crear bloque
 *
 * Valida el body de la request usando CreateBloqueSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateCreateBloque = (req, res, next) => {
    try {
        // Validar y transformar el body usando el schema Zod
        req.body = CreateBloqueSchema.parse(req.body);
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
 * Middleware de validación para crear bloque desde plantilla
 *
 * Valida el body de la request usando CreateBloqueFromTemplateSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateCreateBloqueFromTemplate = (req, res, next) => {
    try {
        // Validar y transformar el body usando el schema Zod
        req.body = CreateBloqueFromTemplateSchema.parse(req.body);
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
 * Middleware de validación para actualizar bloque
 *
 * Valida el body de la request usando UpdateBloqueSchema de Zod.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateUpdateBloque = (req, res, next) => {
    try {
        // Validar y transformar el body usando el schema Zod
        req.body = UpdateBloqueSchema.parse(req.body);
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
 * Middleware de validación para listar bloques
 *
 * Valida los query params usando ListBloquesSchema de Zod.
 * Si la validación es exitosa, actualiza req.validatedQuery con los datos validados (coerción, defaults).
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateListBloques = (req, res, next) => {
    try {
        req.validatedQuery = ListBloquesSchema.parse(req.query);
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
 * Middleware de validación para crear/actualizar capacidad
 *
 * Valida el body de la request usando CreateCapacidadSchema de Zod.
 * Inyecta actividadId desde params antes de validar.
 * Si la validación es exitosa, actualiza req.body con los datos validados y transformados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateCreateCapacidad = (req, res, next) => {
    try {
        // Inyectar actividadId desde params al body antes de validar
        if (req.params['actividadId']) {
            req.body = {
                ...req.body,
                actividadId: req.params['actividadId'],
            };
        }
        // Validar y transformar el body usando el schema Zod
        req.body = CreateCapacidadSchema.parse(req.body);
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
 * Middleware de validación para verificar disponibilidad
 *
 * Valida los query params usando VerificarDisponibilidadSchema de Zod.
 * Inyecta actividadId desde params antes de validar.
 * Si la validación es exitosa, actualiza req.validatedQuery con los datos validados.
 * Si falla, retorna un error 400 con los detalles de validación en español.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateVerificarDisponibilidad = (req, res, next) => {
    try {
        // Inyectar actividadId desde params a los query params antes de validar
        const queryWithActividadId = {
            ...req.query,
            actividadId: req.params['actividadId'],
        };
        // Validar y transformar los query params usando el schema Zod
        req.validatedQuery = VerificarDisponibilidadSchema.parse(queryWithActividadId);
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