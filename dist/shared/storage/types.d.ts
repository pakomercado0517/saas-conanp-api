/**
 * Tipos TypeScript para el módulo de almacenamiento Cloudflare R2
 */
import type { Readable } from 'stream';
/**
 * Opciones para subir un archivo a R2
 */
export interface UploadFileOptions {
    /** Key único del archivo en el bucket (path) */
    key: string;
    /** Contenido del archivo (Buffer, Uint8Array, o Readable stream de Node.js) */
    body: Buffer | Uint8Array | Readable | string;
    /** Tipo MIME del archivo (ej: 'image/jpeg', 'application/pdf') */
    contentType: string;
    /** Tamaño del archivo en bytes */
    contentLength?: number;
    /** Metadatos adicionales del archivo */
    metadata?: Record<string, string>;
}
/**
 * Resultado de una operación de upload
 */
export interface UploadFileResult {
    /** Key del archivo subido */
    key: string;
    /** URL pública del archivo (si está configurada) */
    publicUrl?: string;
    /** Tamaño del archivo en bytes */
    size: number;
}
/**
 * Opciones para generar una URL firmada
 */
export interface SignedUrlOptions {
    /** Key del archivo en el bucket */
    key: string;
    /** Tiempo de expiración en segundos (default: 3600 = 1 hora) */
    expiresIn?: number;
    /** Método HTTP permitido (default: 'GET') */
    method?: 'GET' | 'PUT';
}
/**
 * Configuración de R2 Storage
 */
export interface StorageConfig {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    endpoint: string;
    publicUrl?: string;
}
//# sourceMappingURL=types.d.ts.map