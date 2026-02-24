import type { UUID } from '../../../shared/database/types.js';
import { EvidenciaAmbiental } from '../../../modules/evidencias/models/evidencia-ambiental.model.js';
import type { CreateEvidenciaDTO, UpdateEvidenciaDTO, ListEvidenciasDTO } from '../../../modules/evidencias/validators/evidencia.validator.js';
import type { PaginationMeta } from '../../../shared/responses/types.js';
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
export declare const createEvidencia: (data: CreateEvidenciaDTO, organizationId: UUID, userId: UUID, file?: Buffer, contentType?: string) => Promise<EvidenciaAmbiental>;
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
export declare const getEvidenciaById: (evidenciaId: UUID, organizationId: UUID, userId: UUID) => Promise<EvidenciaAmbiental>;
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
export declare const listEvidencias: (organizationId: UUID, filters: ListEvidenciasDTO, userId: UUID) => Promise<{
    data: EvidenciaAmbiental[];
    pagination: PaginationMeta;
}>;
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
export declare const updateEvidencia: (evidenciaId: UUID, organizationId: UUID, data: UpdateEvidenciaDTO, userId: UUID, file?: Buffer, contentType?: string) => Promise<EvidenciaAmbiental>;
/**
 * Elimina una evidencia (hard delete)
 *
 * @param evidenciaId - ID de la evidencia
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que elimina
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si la evidencia no existe o el evento no pertenece a la organización
 */
export declare const deleteEvidencia: (evidenciaId: UUID, organizationId: UUID, userId: UUID) => Promise<void>;
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
export declare const getEvidenciaSignedUrl: (evidenciaId: UUID, organizationId: UUID, userId: UUID, expiresIn?: number) => Promise<string>;
//# sourceMappingURL=evidencia.service.d.ts.map