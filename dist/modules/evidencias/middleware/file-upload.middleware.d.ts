import type { RequestHandler } from 'express';
/**
 * Middleware de multer configurado para upload de archivos de evidencias
 *
 * Valida:
 * - Tamaño máximo: 10MB
 * - Tipos MIME permitidos: image/jpeg, image/png, image/webp, application/pdf
 *
 * El archivo estará disponible en req.file después de este middleware
 */
export declare const uploadFile: RequestHandler;
//# sourceMappingURL=file-upload.middleware.d.ts.map