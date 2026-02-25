import { z } from 'zod';
import { CreateDependenciaInvitationSchema, ListDependenciaInvitationsSchema, } from '../validators/dependencia-invitation.validator.js';
const validateBody = (schema) => (req, res, next) => {
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
        req.validatedQuery = schema.parse(req.query);
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
export const validateCreateDependenciaInvitation = validateBody(CreateDependenciaInvitationSchema);
export const validateListDependenciaInvitations = validateQuery(ListDependenciaInvitationsSchema);
//# sourceMappingURL=dependencia-invitation-validation.middleware.js.map