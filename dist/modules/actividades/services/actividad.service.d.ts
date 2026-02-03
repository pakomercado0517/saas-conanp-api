import type { UUID } from '../../../shared/database/types.js';
import { Actividad } from '../../../modules/actividades/models/actividad.model.js';
import type { CreateActividadDTO, UpdateActividadDTO, ListActividadesDTO } from '../../../modules/actividades/validators/actividad.validator.js';
import type { PaginationMeta } from '../../../shared/responses/types.js';
/**
 * Crea una nueva actividad.
 * Solo los administradores pueden crear actividades.
 *
 * @param data - Datos de la actividad
 * @param userId - ID del usuario que crea (debe ser admin)
 * @returns Actividad creada
 * @throws {ForbiddenError} Si no es admin
 * @throws {NotFoundError} Si la organización no existe
 * @throws {ValidationError} Si el tipo de agenda no es válido
 */
export declare const createActividad: (data: CreateActividadDTO, userId: UUID) => Promise<Actividad>;
/**
 * Obtiene una actividad por ID.
 * Cualquier usuario con acceso a la organización puede leer actividades.
 *
 * @param actividadId - ID de la actividad
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que solicita
 * @returns Actividad encontrada
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si la actividad no existe o no pertenece a la organización
 */
export declare const getActividadById: (actividadId: UUID, organizationId: UUID, userId: UUID) => Promise<Actividad>;
/**
 * Lista actividades con paginación y filtros.
 * Cualquier usuario con acceso a la organización puede listar actividades.
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros de paginación y búsqueda
 * @param userId - ID del usuario que solicita
 * @returns Datos paginados de actividades
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 */
export declare const listActividades: (organizationId: UUID, filters: ListActividadesDTO, userId: UUID) => Promise<{
    data: Actividad[];
    pagination: PaginationMeta;
}>;
/**
 * Actualiza una actividad existente.
 * Solo los administradores pueden actualizar actividades.
 *
 * @param actividadId - ID de la actividad
 * @param organizationId - ID de la organización (multi-tenant)
 * @param data - Datos a actualizar
 * @param userId - ID del usuario que actualiza (debe ser admin)
 * @returns Actividad actualizada
 * @throws {ForbiddenError} Si no es admin o no tiene acceso
 * @throws {NotFoundError} Si la actividad no existe o no pertenece a la organización
 * @throws {ValidationError} Si el tipo de agenda no es válido
 */
export declare const updateActividad: (actividadId: UUID, organizationId: UUID, data: UpdateActividadDTO, userId: UUID) => Promise<Actividad>;
/**
 * Elimina una actividad (soft delete).
 * Solo los administradores pueden eliminar actividades.
 *
 * @param actividadId - ID de la actividad
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que elimina (debe ser admin)
 * @throws {ForbiddenError} Si no es admin o no tiene acceso
 * @throws {NotFoundError} Si la actividad no existe o no pertenece a la organización
 */
export declare const deleteActividad: (actividadId: UUID, organizationId: UUID, userId: UUID) => Promise<void>;
//# sourceMappingURL=actividad.service.d.ts.map