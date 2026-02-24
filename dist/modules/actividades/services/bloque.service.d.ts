import type { UUID } from '../../../shared/database/types.js';
import { Bloque } from '../../../modules/actividades/models/bloque.model.js';
import type { CreateBloqueDTO, CreateBloqueFromTemplateDTO, UpdateBloqueDTO, ListBloquesDTO } from '../../../modules/actividades/validators/bloque.validator.js';
import type { PaginationMeta } from '../../../shared/responses/types.js';
/**
 * Obtiene todas las plantillas de bloques para una actividad
 *
 * @param actividadId - ID de la actividad
 * @param organizationId - ID de la organización (multi-tenant)
 * @returns Array de bloques plantilla
 */
export declare const getBloquesTemplates: (actividadId: UUID, organizationId: UUID) => Promise<Bloque[]>;
/**
 * Crea un nuevo bloque.
 * Solo los administradores pueden crear bloques.
 *
 * @param data - Datos del bloque
 * @param userId - ID del usuario que crea (debe ser admin)
 * @returns Bloque creado
 * @throws {ForbiddenError} Si no es admin
 * @throws {NotFoundError} Si la actividad no existe
 * @throws {ValidationError} Si la actividad no tiene tipo BLOQUES o hay solapamiento
 */
export declare const createBloque: (data: CreateBloqueDTO, userId: UUID) => Promise<Bloque>;
/**
 * Crea un bloque desde una plantilla.
 * Solo los administradores pueden crear bloques desde plantillas.
 *
 * @param data - Datos para crear desde plantilla
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que crea (debe ser admin)
 * @returns Bloque creado
 * @throws {ForbiddenError} Si no es admin
 * @throws {NotFoundError} Si la plantilla no existe
 * @throws {ValidationError} Si hay solapamiento
 */
export declare const createBloqueFromTemplate: (data: CreateBloqueFromTemplateDTO, organizationId: UUID, userId: UUID) => Promise<Bloque>;
/**
 * Obtiene un bloque por ID.
 * Cualquier usuario con acceso a la organización puede leer bloques.
 *
 * @param bloqueId - ID del bloque
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que solicita
 * @returns Bloque encontrado
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el bloque no existe o no pertenece a la organización
 */
export declare const getBloqueById: (bloqueId: UUID, organizationId: UUID, userId: UUID) => Promise<Bloque>;
/**
 * Lista bloques de una actividad específica.
 * Cualquier usuario con acceso a la organización puede listar bloques.
 *
 * @param actividadId - ID de la actividad
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros de paginación y búsqueda
 * @param userId - ID del usuario que solicita
 * @returns Datos paginados de bloques
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si la actividad no existe
 */
export declare const listBloquesByActividad: (actividadId: UUID, organizationId: UUID, filters: Omit<ListBloquesDTO, "actividadId" | "organizationId">, userId: UUID) => Promise<{
    data: Bloque[];
    pagination: PaginationMeta;
}>;
/**
 * Lista bloques con paginación y filtros.
 * Cualquier usuario con acceso a la organización puede listar bloques.
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros de paginación y búsqueda
 * @param userId - ID del usuario que solicita
 * @returns Datos paginados de bloques
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 */
export declare const listBloques: (organizationId: UUID, filters: ListBloquesDTO, userId: UUID) => Promise<{
    data: Bloque[];
    pagination: PaginationMeta;
}>;
/**
 * Actualiza un bloque existente.
 * Solo los administradores pueden actualizar bloques.
 *
 * @param bloqueId - ID del bloque
 * @param organizationId - ID de la organización (multi-tenant)
 * @param data - Datos a actualizar
 * @param userId - ID del usuario que actualiza (debe ser admin)
 * @returns Bloque actualizado
 * @throws {ForbiddenError} Si no es admin o no tiene acceso
 * @throws {NotFoundError} Si el bloque no existe o no pertenece a la organización
 * @throws {ValidationError} Si hay solapamiento o la actividad no tiene tipo BLOQUES
 */
export declare const updateBloque: (bloqueId: UUID, organizationId: UUID, data: UpdateBloqueDTO, userId: UUID) => Promise<Bloque>;
/**
 * Elimina un bloque.
 * Solo los administradores pueden eliminar bloques.
 *
 * @param bloqueId - ID del bloque
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que elimina (debe ser admin)
 * @throws {ForbiddenError} Si no es admin o no tiene acceso
 * @throws {NotFoundError} Si el bloque no existe o no pertenece a la organización
 */
export declare const deleteBloque: (bloqueId: UUID, organizationId: UUID, userId: UUID) => Promise<void>;
//# sourceMappingURL=bloque.service.d.ts.map