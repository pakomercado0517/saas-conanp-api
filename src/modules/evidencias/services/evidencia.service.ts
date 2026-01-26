import { Op } from 'sequelize';
import type { UUID } from '@/shared/database/types.js';
import { EvidenciaAmbiental } from '@/modules/evidencias/models/evidencia-ambiental.model.js';
import { EventoOperativo } from '@/modules/eventos/models/evento-operativo.model.js';
import type {
  CreateEvidenciaDTO,
  UpdateEvidenciaDTO,
  ListEvidenciasDTO,
} from '@/modules/evidencias/validators/evidencia.validator.js';
import { NotFoundError, ValidationError } from '@/shared/errors/index.js';
import type { PaginationMeta } from '@/shared/responses/types.js';
import { logger } from '@/shared/logger/index.js';
import { assertCanAccessOrganization } from '@/modules/organizations/services/organization.service.js';
import { uploadFile, deleteFile, getSignedUrl, generateFileKey } from '@/shared/storage/index.js';
import type { UploadFileResult } from '@/shared/storage/types.js';
import { URL } from 'url';

/**
 * Constantes de validación de archivos
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] as const;
// ALLOWED_EXTENSIONS se mantiene para referencia, aunque se usa MIME_TO_EXTENSION para mapeo
// const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf'] as const;

/**
 * Mapeo de tipos MIME a extensiones
 */
const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

/**
 * Valida un archivo antes de subirlo
 *
 * @param file - Buffer del archivo
 * @param contentType - Tipo MIME del archivo
 * @param fileSize - Tamaño del archivo en bytes
 * @throws {ValidationError} Si el archivo no cumple con las validaciones
 */
const validateFile = (_file: Buffer, contentType: string, fileSize: number): void => {
  // Validar tamaño
  if (fileSize > MAX_FILE_SIZE) {
    throw new ValidationError(
      `El archivo excede el tamaño máximo permitido de ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      'file',
      { fileSize, maxSize: MAX_FILE_SIZE }
    );
  }

  // Validar tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(contentType as (typeof ALLOWED_MIME_TYPES)[number])) {
    throw new ValidationError(
      `Tipo de archivo no permitido. Tipos permitidos: ${ALLOWED_MIME_TYPES.join(', ')}`,
      'contentType',
      { contentType, allowedTypes: ALLOWED_MIME_TYPES }
    );
  }
};

/**
 * Extrae el key del archivo desde una URL de R2
 *
 * @param url - URL completa del archivo en R2
 * @returns Key del archivo (path relativo)
 * @throws {ValidationError} Si la URL no es válida
 */
const extractFileKeyFromUrl = (url: string): string => {
  try {
    // Formato esperado: https://pub-xxxxx.r2.dev/evidencias/YYYY-MM-DD/uuid.ext
    // O: https://account-id.r2.cloudflarestorage.com/bucket-name/evidencias/YYYY-MM-DD/uuid.ext
    const urlObj = new URL(url);
    const path = urlObj.pathname;

    // Remover el primer slash y cualquier parte del bucket name si está en el path
    // El path debería ser algo como: /evidencias/YYYY-MM-DD/uuid.ext
    // O: /bucket-name/evidencias/YYYY-MM-DD/uuid.ext
    const parts = path.split('/').filter((p) => p !== '');

    // Si el primer elemento parece ser un bucket name (muy largo o con guiones), saltarlo
    // De lo contrario, usar todo el path
    const key = parts.join('/');

    if (!key || key.trim() === '') {
      throw new ValidationError('No se pudo extraer el key del archivo desde la URL', 'fileUrl', {
        url,
      });
    }

    return key;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('URL de archivo inválida', 'fileUrl', { url, error });
  }
};

/**
 * Obtiene un evento y valida que pertenezca a la organización
 *
 * @param eventoId - ID del evento
 * @param organizationId - ID de la organización (multi-tenant)
 * @returns Evento encontrado
 * @throws {NotFoundError} Si el evento no existe o no pertenece a la organización
 */
const getEventoWithOrganization = async (
  eventoId: UUID,
  organizationId: UUID
): Promise<EventoOperativo> => {
  const evento = await EventoOperativo.findOne({
    where: {
      id: eventoId,
      organizationId, // Multi-tenant obligatorio
    },
  });

  if (!evento) {
    throw new NotFoundError('Evento', { eventoId, organizationId });
  }

  return evento;
};

/**
 * Crea una nueva evidencia ambiental asociada a un evento
 *
 * @param data - Datos de la evidencia
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que crea
 * @param file - Buffer del archivo (opcional)
 * @param contentType - Tipo MIME del archivo (opcional, requerido si hay file)
 * @returns Evidencia creada con relación EventoOperativo cargada
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el evento no existe o no pertenece a la organización
 * @throws {ValidationError} Si las validaciones de archivo fallan
 */
export const createEvidencia = async (
  data: CreateEvidenciaDTO,
  organizationId: UUID,
  userId: UUID,
  file?: Buffer,
  contentType?: string
): Promise<EvidenciaAmbiental> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(userId, organizationId);

  // Validar que el evento exista y pertenezca a la organización
  await getEventoWithOrganization(data.eventoId, organizationId);

  let fileUrl: string | null = null;

  // Si se proporciona archivo, subirlo a R2
  if (file && contentType) {
    // Validar archivo
    validateFile(file, contentType, file.length);

    // Obtener extensión del tipo MIME
    const extension = MIME_TO_EXTENSION[contentType];
    if (!extension) {
      throw new ValidationError(
        `No se pudo determinar la extensión para el tipo MIME: ${contentType}`,
        'contentType',
        { contentType }
      );
    }

    // Generar key único
    const key = generateFileKey('evidencias', extension);

    // Subir archivo a R2
    const uploadResult: UploadFileResult = await uploadFile({
      key,
      body: file,
      contentType,
      contentLength: file.length,
      metadata: {
        eventoId: data.eventoId,
        type: data.type,
        uploadedBy: userId,
      },
    });

    // Usar URL pública si está disponible, sino construir desde el key
    fileUrl = uploadResult.publicUrl || `${process.env['R2_PUBLIC_URL']}/${key}`;
  } else if (data.fileUrl) {
    // Si se proporciona fileUrl directamente, usarla
    fileUrl = data.fileUrl;
  }

  // Crear evidencia en BD
  const evidencia = await EvidenciaAmbiental.create({
    eventoId: data.eventoId,
    type: data.type,
    description: data.description ?? null,
    fileUrl,
  });

  // Cargar relación EventoOperativo
  await evidencia.reload({
    include: [{ model: EventoOperativo, as: 'EventoOperativo' }],
  });

  logger.info(
    {
      evidenciaId: evidencia.id,
      eventoId: evidencia.eventoId,
      type: evidencia.type,
      hasFile: !!fileUrl,
      organizationId,
      userId,
    },
    'Evidencia creada exitosamente'
  );

  return evidencia;
};

/**
 * Obtiene una evidencia por ID
 *
 * @param evidenciaId - ID de la evidencia
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que solicita
 * @returns Evidencia encontrada con relación EventoOperativo cargada
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si la evidencia no existe o el evento no pertenece a la organización
 */
export const getEvidenciaById = async (
  evidenciaId: UUID,
  organizationId: UUID,
  userId: UUID
): Promise<EvidenciaAmbiental> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(userId, organizationId);

  // Buscar evidencia con relación EventoOperativo para validar multi-tenant
  const evidencia = await EvidenciaAmbiental.findOne({
    where: { id: evidenciaId },
    include: [
      {
        model: EventoOperativo,
        as: 'EventoOperativo',
        where: { organizationId }, // Multi-tenant obligatorio
        required: true,
      },
    ],
  });

  if (!evidencia) {
    throw new NotFoundError('Evidencia', { evidenciaId, organizationId });
  }

  return evidencia;
};

/**
 * Lista evidencias con paginación y filtros
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros de paginación y búsqueda
 * @param userId - ID del usuario que solicita
 * @returns Datos paginados de evidencias con relación EventoOperativo cargada
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si se proporciona eventoId y el evento no existe o no pertenece a la organización
 */
export const listEvidencias = async (
  organizationId: UUID,
  filters: ListEvidenciasDTO,
  userId: UUID
): Promise<{ data: EvidenciaAmbiental[]; pagination: PaginationMeta }> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(userId, organizationId);

  // Si se proporciona eventoId, validar que el evento pertenezca a la organización
  if (filters.eventoId) {
    await getEventoWithOrganization(filters.eventoId, organizationId);
  }

  // Construir query con filtros
  const where: Record<string, unknown> = {};

  // Filtrar por eventoId si se proporciona
  if (filters.eventoId) {
    where['eventoId'] = filters.eventoId;
  }

  // Filtrar por type si se proporciona
  if (filters.type) {
    where['type'] = { [Op.iLike]: `%${filters.type}%` };
  }

  // Configurar paginación
  const limit = filters.limit;
  const sortBy = filters.sortBy ?? 'createdAt';
  const sortOrder = filters.sortOrder ?? 'desc';
  const offset = (filters.page - 1) * limit;

  // Ejecutar query con paginación
  // Incluir relación EventoOperativo para validar multi-tenant
  const result = await EvidenciaAmbiental.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sortBy, sortOrder]],
    include: [
      {
        model: EventoOperativo,
        as: 'EventoOperativo',
        where: { organizationId }, // Multi-tenant obligatorio
        required: true,
      },
    ],
  });

  const total = result.count as number;
  const totalPages = Math.ceil(total / limit);

  const pagination: PaginationMeta = {
    page: filters.page,
    limit,
    total,
    totalPages,
  };

  return { data: result.rows, pagination };
};

/**
 * Actualiza una evidencia existente
 *
 * @param evidenciaId - ID de la evidencia
 * @param organizationId - ID de la organización (multi-tenant)
 * @param data - Datos a actualizar
 * @param userId - ID del usuario que actualiza
 * @param file - Buffer del archivo nuevo (opcional)
 * @param contentType - Tipo MIME del archivo nuevo (opcional, requerido si hay file)
 * @returns Evidencia actualizada con relación EventoOperativo cargada
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si la evidencia no existe o el evento no pertenece a la organización
 * @throws {ValidationError} Si las validaciones de archivo fallan
 */
export const updateEvidencia = async (
  evidenciaId: UUID,
  organizationId: UUID,
  data: UpdateEvidenciaDTO,
  userId: UUID,
  file?: Buffer,
  contentType?: string
): Promise<EvidenciaAmbiental> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(userId, organizationId);

  // Obtener evidencia y validar que existe y pertenece a la organización
  const evidencia = await getEvidenciaById(evidenciaId, organizationId, userId);

  let newFileUrl: string | null | undefined = data.fileUrl;

  // Si se proporciona nuevo archivo
  if (file && contentType) {
    // Validar archivo
    validateFile(file, contentType, file.length);

    // Obtener extensión del tipo MIME
    const extension = MIME_TO_EXTENSION[contentType];
    if (!extension) {
      throw new ValidationError(
        `No se pudo determinar la extensión para el tipo MIME: ${contentType}`,
        'contentType',
        { contentType }
      );
    }

    // Eliminar archivo anterior de R2 si existe
    if (evidencia.fileUrl) {
      try {
        const oldKey = extractFileKeyFromUrl(evidencia.fileUrl);
        await deleteFile(oldKey);
        logger.info(
          {
            evidenciaId,
            oldKey,
            organizationId,
            userId,
          },
          'Archivo anterior eliminado de R2'
        );
      } catch (error) {
        // Loggear error pero continuar (archivo huérfano)
        logger.error(
          {
            error,
            evidenciaId,
            oldFileUrl: evidencia.fileUrl,
            organizationId,
            userId,
          },
          'Error al eliminar archivo anterior de R2, continuando con actualización'
        );
      }
    }

    // Generar key único para nuevo archivo
    const key = generateFileKey('evidencias', extension);

    // Subir nuevo archivo a R2
    const uploadResult: UploadFileResult = await uploadFile({
      key,
      body: file,
      contentType,
      contentLength: file.length,
      metadata: {
        eventoId: evidencia.eventoId,
        type: data.type || evidencia.type,
        updatedBy: userId,
      },
    });

    // Usar URL pública si está disponible
    newFileUrl = uploadResult.publicUrl || `${process.env['R2_PUBLIC_URL']}/${key}`;
  } else if (data.fileUrl === null) {
    // Si se actualiza fileUrl a null, eliminar archivo de R2
    if (evidencia.fileUrl) {
      try {
        const key = extractFileKeyFromUrl(evidencia.fileUrl);
        await deleteFile(key);
        logger.info(
          {
            evidenciaId,
            key,
            organizationId,
            userId,
          },
          'Archivo eliminado de R2 al actualizar fileUrl a null'
        );
      } catch (error) {
        // Loggear error pero continuar
        logger.error(
          {
            error,
            evidenciaId,
            fileUrl: evidencia.fileUrl,
            organizationId,
            userId,
          },
          'Error al eliminar archivo de R2, continuando con actualización'
        );
      }
    }
  }

  // Actualizar solo los campos proporcionados
  const updateData: Partial<{
    type: string;
    description: string | null;
    fileUrl: string | null;
  }> = {};

  if (data.type !== undefined) {
    updateData.type = data.type;
  }
  if (data.description !== undefined) {
    updateData.description = data.description;
  }
  if (newFileUrl !== undefined) {
    updateData.fileUrl = newFileUrl;
  }

  await evidencia.update(updateData);

  // Recargar con relación EventoOperativo
  await evidencia.reload({
    include: [{ model: EventoOperativo, as: 'EventoOperativo' }],
  });

  const updatedKeys = Object.keys(updateData);

  logger.info(
    {
      evidenciaId: evidencia.id,
      organizationId,
      updatedFields: updatedKeys,
      userId,
    },
    'Evidencia actualizada exitosamente'
  );

  return evidencia;
};

/**
 * Elimina una evidencia (hard delete)
 *
 * @param evidenciaId - ID de la evidencia
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que elimina
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si la evidencia no existe o el evento no pertenece a la organización
 */
export const deleteEvidencia = async (
  evidenciaId: UUID,
  organizationId: UUID,
  userId: UUID
): Promise<void> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(userId, organizationId);

  // Obtener evidencia y validar que existe y pertenece a la organización
  const evidencia = await getEvidenciaById(evidenciaId, organizationId, userId);

  // Eliminar archivo de R2 si existe
  if (evidencia.fileUrl) {
    try {
      const key = extractFileKeyFromUrl(evidencia.fileUrl);
      await deleteFile(key);
      logger.info(
        {
          evidenciaId,
          key,
          organizationId,
          userId,
        },
        'Archivo eliminado de R2'
      );
    } catch (error) {
      // Loggear error pero continuar con eliminación de BD (archivo huérfano)
      logger.error(
        {
          error,
          evidenciaId,
          fileUrl: evidencia.fileUrl,
          organizationId,
          userId,
        },
        'Error al eliminar archivo de R2, continuando con eliminación de registro'
      );
    }
  }

  // Eliminar registro de BD
  await evidencia.destroy();

  logger.info(
    {
      evidenciaId,
      organizationId,
      userId,
    },
    'Evidencia eliminada exitosamente'
  );
};

/**
 * Genera una URL firmada para acceder a un archivo de evidencia
 *
 * @param evidenciaId - ID de la evidencia
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que solicita
 * @param expiresIn - Tiempo de expiración en segundos (default: 3600 = 1 hora)
 * @returns URL firmada con expiración
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si la evidencia no existe o el evento no pertenece a la organización
 * @throws {ValidationError} Si la evidencia no tiene archivo asociado
 */
export const getEvidenciaSignedUrl = async (
  evidenciaId: UUID,
  organizationId: UUID,
  userId: UUID,
  expiresIn: number = 3600
): Promise<string> => {
  // Validar acceso a la evidencia
  const evidencia = await getEvidenciaById(evidenciaId, organizationId, userId);

  // Validar que tenga archivo
  if (!evidencia.fileUrl) {
    throw new ValidationError('La evidencia no tiene un archivo asociado', 'fileUrl', {
      evidenciaId,
    });
  }

  // Extraer key del archivo
  const key = extractFileKeyFromUrl(evidencia.fileUrl);

  // Generar URL firmada
  const signedUrl = await getSignedUrl({
    key,
    expiresIn,
  });

  logger.debug(
    {
      evidenciaId,
      key,
      expiresIn,
      organizationId,
      userId,
    },
    'URL firmada generada exitosamente'
  );

  return signedUrl;
};
