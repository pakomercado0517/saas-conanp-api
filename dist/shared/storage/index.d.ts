import { S3Client } from '@aws-sdk/client-s3';
import type { UploadFileOptions, UploadFileResult, SignedUrlOptions, StorageConfig } from './types.js';
/**
 * Cliente S3 configurado para Cloudflare R2
 *
 * R2 es compatible con la API de S3, por lo que usamos el SDK de AWS S3
 * con un endpoint personalizado apuntando a R2.
 */
declare const s3Client: S3Client;
/**
 * Subir un archivo a Cloudflare R2
 *
 * @param options - Opciones para subir el archivo
 * @returns Información del archivo subido
 * @throws {ValidationError} Si las opciones son inválidas
 */
export declare const uploadFile: (options: UploadFileOptions) => Promise<UploadFileResult>;
/**
 * Eliminar un archivo de Cloudflare R2
 *
 * @param key - Key del archivo a eliminar
 * @throws {ValidationError} Si el key es inválido
 */
export declare const deleteFile: (key: string) => Promise<void>;
/**
 * Generar una URL firmada (presigned URL) para acceder a un archivo
 *
 * Las URLs firmadas permiten acceso temporal a archivos privados sin exponer
 * las credenciales. Útil para compartir archivos de forma segura.
 *
 * @param options - Opciones para generar la URL firmada
 * @returns URL firmada con expiración
 * @throws {ValidationError} Si las opciones son inválidas
 */
export declare const getSignedUrl: (options: SignedUrlOptions) => Promise<string>;
/**
 * Obtener la URL pública de un archivo
 *
 * Solo funciona si R2_PUBLIC_URL está configurada en las variables de entorno.
 * Si no está configurada, retorna undefined.
 *
 * @param key - Key del archivo
 * @returns URL pública del archivo o undefined si no está configurada
 */
export declare const getPublicUrl: (key: string) => string | undefined;
/**
 * Generar un key único para un archivo
 *
 * Usa UUID para evitar colisiones y organiza los archivos por tipo y fecha.
 *
 * @param prefix - Prefijo para organizar archivos (ej: 'evidencias', 'documentos')
 * @param extension - Extensión del archivo (ej: 'jpg', 'pdf')
 * @returns Key único para el archivo
 */
export declare const generateFileKey: (prefix: string, extension: string) => string;
export declare const storageConfig: Readonly<StorageConfig>;
export { s3Client };
//# sourceMappingURL=index.d.ts.map