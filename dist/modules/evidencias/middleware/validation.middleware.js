import { z } from 'zod';
import { CreateEvidenciaSchema, UpdateEvidenciaSchema, ListEvidenciasSchema, } from '../validators/evidencia.validator.js';
/**
 * Middleware de validación para crear evidencia
 *
 * Valida el body de la request usando CreateEvidenciaSchema de Zod.
 * Nota: Para multipart/form-data, multer procesa el archivo primero y los campos de texto
 * quedan en req.body. Este middleware valida los campos de texto.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateCreateEvidencia = (req, res, next) => {
    try {
        // Extraer eventoId del param (no del body cuando viene de ruta anidada)
        const eventoId = req.params['eventoId'];
        // Construir objeto para validar (eventoId viene del param, no del body)
        const dataToValidate = {
            eventoId,
            type: req.body['type'],
            description: req.body['description'],
            fileUrl: req.body['fileUrl'],
        };
        // Validar y transformar usando el schema Zod
        const validated = CreateEvidenciaSchema.parse(dataToValidate);
        // Actualizar req.body con datos validados (sin eventoId, ya que viene del param)
        req.body = {
            type: validated.type,
            description: validated.description,
            fileUrl: validated.fileUrl,
        };
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
 * Middleware de validación para actualizar evidencia
 *
 * Valida el body de la request usando UpdateEvidenciaSchema de Zod.
 * Para multipart/form-data, multer procesa el archivo primero.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateUpdateEvidencia = (req, res, next) => {
    try {
        // Validar y transformar el body usando el schema Zod
        req.body = UpdateEvidenciaSchema.parse(req.body);
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
 * Middleware de validación para listar evidencias
 *
 * Valida los query params usando ListEvidenciasSchema de Zod.
 * El eventoId viene del param, no del query, así que se agrega después de la validación.
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const validateListEvidencias = (req, res, next) => {
    try {
        // Validar y transformar los query params usando el schema Zod
        const validated = ListEvidenciasSchema.parse(req.query);
        // Agregar eventoId del param a los filtros validados
        const eventoId = req.params['eventoId'];
        req.validatedQuery = {
            ...validated,
            eventoId, // El eventoId viene del param, no del query
        };
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