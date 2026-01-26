import type { Request, Response, NextFunction } from 'express';
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
export declare const validateCreateEvidencia: (req: Request, res: Response, next: NextFunction) => void;
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
export declare const validateUpdateEvidencia: (req: Request, res: Response, next: NextFunction) => void;
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
export declare const validateListEvidencias: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map