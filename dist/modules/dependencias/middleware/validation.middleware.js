import { z } from 'zod';
import { CreateDependenciaSchema, UpdateDependenciaSchema, ListDependenciasSchema, CreateAreaUnderDependenciaSchema, CreateDependenciaAdminSchema, } from '../validators/dependencia.validator.js';
const validate = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
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
const validateQuery = (schema) => (req, res, next) => {
    try {
        const parsedQuery = schema.parse(req.query);
        req.validatedQuery = parsedQuery;
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
                message: 'Los parámetros de consulta no son válidos',
                code: 'VALIDATION_ERROR',
                detalles,
            });
            return;
        }
        next(error);
    }
};
export const validateCreateDependencia = validate(CreateDependenciaSchema);
export const validateUpdateDependencia = validate(UpdateDependenciaSchema);
export const validateListDependencias = validateQuery(ListDependenciasSchema);
export const validateCreateAreaUnderDependencia = validate(CreateAreaUnderDependenciaSchema);
export const validateCreateDependenciaAdmin = validate(CreateDependenciaAdminSchema);
//# sourceMappingURL=validation.middleware.js.map