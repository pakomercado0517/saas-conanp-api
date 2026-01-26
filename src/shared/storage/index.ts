import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl as getPresignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import type {
  UploadFileOptions,
  UploadFileResult,
  SignedUrlOptions,
  StorageConfig,
} from './types.js';
import { ValidationError } from '@/shared/errors/index.js';
import { logger } from '@/shared/logger/index.js';

dotenv.config();

/**
 * Validar que todas las variables de entorno requeridas estén configuradas
 */
const validateEnvironmentVariables = (): StorageConfig => {
  const accountId = process.env['R2_ACCOUNT_ID'];
  const accessKeyId = process.env['R2_ACCESS_KEY_ID'];
  const secretAccessKey = process.env['R2_SECRET_ACCESS_KEY'];
  const bucketName = process.env['R2_BUCKET_NAME'];
  const endpoint = process.env['R2_ENDPOINT'];
  const publicUrl = process.env['R2_PUBLIC_URL'];

  if (!accountId) {
    throw new Error('R2_ACCOUNT_ID no está definida en las variables de entorno');
  }

  if (!accessKeyId) {
    throw new Error('R2_ACCESS_KEY_ID no está definida en las variables de entorno');
  }

  if (!secretAccessKey) {
    throw new Error('R2_SECRET_ACCESS_KEY no está definida en las variables de entorno');
  }

  if (!bucketName) {
    throw new Error('R2_BUCKET_NAME no está definida en las variables de entorno');
  }

  if (!endpoint) {
    throw new Error('R2_ENDPOINT no está definida en las variables de entorno');
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    endpoint,
    ...(publicUrl && { publicUrl }),
  };
};

// Validar y obtener configuración
const config = validateEnvironmentVariables();

/**
 * Cliente S3 configurado para Cloudflare R2
 *
 * R2 es compatible con la API de S3, por lo que usamos el SDK de AWS S3
 * con un endpoint personalizado apuntando a R2.
 */
const s3Client = new S3Client({
  region: 'auto', // R2 requiere 'auto' como región
  endpoint: config.endpoint,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
});

/**
 * Subir un archivo a Cloudflare R2
 *
 * @param options - Opciones para subir el archivo
 * @returns Información del archivo subido
 * @throws {ValidationError} Si las opciones son inválidas
 */
export const uploadFile = async (options: UploadFileOptions): Promise<UploadFileResult> => {
  const { key, body, contentType, contentLength, metadata } = options;

  // Validar que el key no esté vacío
  if (!key || key.trim() === '') {
    throw new ValidationError('El key del archivo es requerido');
  }

  // Validar que el body esté presente
  if (!body) {
    throw new ValidationError('El contenido del archivo es requerido');
  }

  // Validar que el contentType esté presente
  if (!contentType || contentType.trim() === '') {
    throw new ValidationError('El tipo de contenido (contentType) es requerido');
  }

  try {
    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
      ...(contentLength && { ContentLength: contentLength }),
      ...(metadata && { Metadata: metadata }),
    });

    await s3Client.send(command);

    logger.info(
      {
        key,
        bucket: config.bucketName,
        contentType,
        size: contentLength,
      },
      'Archivo subido exitosamente a R2'
    );

    const result: UploadFileResult = {
      key,
      size: contentLength || 0,
    };

    // Si hay URL pública configurada, agregarla al resultado
    if (config.publicUrl) {
      result.publicUrl = `${config.publicUrl}/${key}`;
    }

    return result;
  } catch (error) {
    logger.error(
      {
        error,
        key,
        bucket: config.bucketName,
      },
      'Error al subir archivo a R2'
    );
    throw new ValidationError(
      `Error al subir archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`
    );
  }
};

/**
 * Eliminar un archivo de Cloudflare R2
 *
 * @param key - Key del archivo a eliminar
 * @throws {ValidationError} Si el key es inválido
 */
export const deleteFile = async (key: string): Promise<void> => {
  if (!key || key.trim() === '') {
    throw new ValidationError('El key del archivo es requerido');
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    });

    await s3Client.send(command);

    logger.info(
      {
        key,
        bucket: config.bucketName,
      },
      'Archivo eliminado exitosamente de R2'
    );
  } catch (error) {
    logger.error(
      {
        error,
        key,
        bucket: config.bucketName,
      },
      'Error al eliminar archivo de R2'
    );
    throw new ValidationError(
      `Error al eliminar archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`
    );
  }
};

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
export const getSignedUrl = async (options: SignedUrlOptions): Promise<string> => {
  const { key, expiresIn = 3600, method = 'GET' } = options;

  if (!key || key.trim() === '') {
    throw new ValidationError('El key del archivo es requerido');
  }

  if (expiresIn <= 0) {
    throw new ValidationError('El tiempo de expiración debe ser mayor a cero');
  }

  try {
    const command = new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    });

    const signedUrl = await getPresignedUrl(s3Client, command, {
      expiresIn,
    });

    logger.debug(
      {
        key,
        expiresIn,
        method,
      },
      'URL firmada generada exitosamente'
    );

    return signedUrl;
  } catch (error) {
    logger.error(
      {
        error,
        key,
        bucket: config.bucketName,
      },
      'Error al generar URL firmada'
    );
    throw new ValidationError(
      `Error al generar URL firmada: ${error instanceof Error ? error.message : 'Error desconocido'}`
    );
  }
};

/**
 * Obtener la URL pública de un archivo
 *
 * Solo funciona si R2_PUBLIC_URL está configurada en las variables de entorno.
 * Si no está configurada, retorna undefined.
 *
 * @param key - Key del archivo
 * @returns URL pública del archivo o undefined si no está configurada
 */
export const getPublicUrl = (key: string): string | undefined => {
  if (!key || key.trim() === '') {
    throw new ValidationError('El key del archivo es requerido');
  }

  if (!config.publicUrl) {
    return undefined;
  }

  return `${config.publicUrl}/${key}`;
};

/**
 * Generar un key único para un archivo
 *
 * Usa UUID para evitar colisiones y organiza los archivos por tipo y fecha.
 *
 * @param prefix - Prefijo para organizar archivos (ej: 'evidencias', 'documentos')
 * @param extension - Extensión del archivo (ej: 'jpg', 'pdf')
 * @returns Key único para el archivo
 */
export const generateFileKey = (prefix: string, extension: string): string => {
  const uuid = randomUUID();
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${prefix}/${timestamp}/${uuid}.${extension}`;
};

// Exportar configuración (solo lectura)
export const storageConfig: Readonly<StorageConfig> = config;

// Exportar cliente (para casos avanzados)
export { s3Client };
