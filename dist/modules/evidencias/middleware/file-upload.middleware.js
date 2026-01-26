import multer from 'multer';
/**
 * Configuración de multer para upload de archivos de evidencias
 *
 * - Almacena archivos en memoria (no en disco)
 * - Límite de tamaño: 10MB
 * - Tipos MIME permitidos: imágenes (jpeg, png, webp) y PDFs
 */
const storage = multer.memoryStorage();
/**
 * Middleware de multer configurado para upload de archivos de evidencias
 *
 * Valida:
 * - Tamaño máximo: 10MB
 * - Tipos MIME permitidos: image/jpeg, image/png, image/webp, application/pdf
 *
 * El archivo estará disponible en req.file después de este middleware
 */
export const uploadFile = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (_req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error(`Tipo de archivo no permitido. Tipos permitidos: ${allowedMimes.join(', ')}`));
        }
    },
}).single('file');
//# sourceMappingURL=file-upload.middleware.js.map