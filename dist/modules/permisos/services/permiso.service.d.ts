import type { UUID } from '../../../shared/database/types.js';
import { Permiso } from '../../../modules/permisos/models/permiso.model.js';
import type { CreatePermisoDTO, UpdatePermisoDTO, ListPermisosDTO } from '../../../modules/permisos/validators/permiso.validator.js';
import type { PaginationMeta } from '../../../shared/responses/types.js';
import { DateTime } from '../../../shared/dates/index.js';
/**
 * Valida que las fechas de vigencia sean correctas.
 *
 * @param validFrom - Fecha de inicio
 * @param validTo - Fecha de fin
 * @throws {ValidationError} Si las fechas no son válidas
 */
export declare const validateFechasVigencia: (validFrom: DateTime | Date, validTo: DateTime | Date) => void;
/**
 * Verifica si un permiso está vigente en una fecha específica (o fecha actual).
 *
 * @param permiso - El permiso a verificar
 * @param date - Fecha a verificar (opcional, default: fecha actual)
 * @returns true si el permiso está vigente, false en caso contrario
 */
export declare const isPermisoVigente: (permiso: Permiso, date?: DateTime) => boolean;
/**
 * Valida que un prestador tenga un permiso vigente para una actividad específica.
 *
 * @param prestadorId - ID del prestador
 * @param actividadId - ID de la actividad
 * @param organizationId - ID de la organización (multi-tenant)
 * @param date - Fecha a verificar (opcional, default: fecha actual)
 * @returns Permiso vigente o null si no existe
 * @throws {ValidationError} Si el prestador o actividad no pertenecen a la organización
 */
export declare const validatePrestadorHasPermisoVigente: (prestadorId: UUID, actividadId: UUID, organizationId: UUID, date?: DateTime) => Promise<Permiso | null>;
/**
 * Crea un nuevo permiso para un prestador y actividad.
 *
 * @param data - Datos del permiso
 * @param organizationId - ID de la organización (multi-tenant)
 * @param creatorUserId - ID del usuario que crea
 * @returns Permiso creado con relaciones PrestadorProfile y Actividad cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el prestador o actividad no existen
 * @throws {ValidationError} Si el prestador y actividad no pertenecen a la misma organización
 */
export declare const createPermiso: (data: CreatePermisoDTO, organizationId: UUID, creatorUserId: UUID) => Promise<Permiso>;
/**
 * Obtiene un permiso por ID.
 *
 * @param permisoId - ID del permiso
 * @param organizationId - ID de la organización (multi-tenant)
 * @param requestingUserId - ID del usuario que solicita
 * @returns Permiso encontrado con relaciones PrestadorProfile y Actividad cargadas
 * @throws {ForbiddenError} Si no tiene acceso
 * @throws {NotFoundError} Si el permiso no existe o no pertenece a la organización
 */
export declare const getPermisoById: (permisoId: UUID, organizationId: UUID, requestingUserId: UUID) => Promise<Permiso>;
/**
 * Lista permisos de un prestador específico.
 *
 * @param prestadorId - ID del prestador
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros de paginación y búsqueda
 * @param requestingUserId - ID del usuario que solicita
 * @returns Datos paginados de permisos con relaciones cargadas
 * @throws {ForbiddenError} Si no tiene acceso
 * @throws {NotFoundError} Si el prestador no existe
 */
export declare const listPermisosByPrestador: (prestadorId: UUID, organizationId: UUID, filters: ListPermisosDTO, requestingUserId: UUID) => Promise<{
    data: Permiso[];
    pagination: PaginationMeta;
}>;
/**
 * Actualiza un permiso existente.
 *
 * @param permisoId - ID del permiso a actualizar
 * @param organizationId - ID de la organización (multi-tenant)
 * @param data - Datos a actualizar
 * @param requestingUserId - ID del usuario que actualiza
 * @returns Permiso actualizado con relaciones cargadas
 * @throws {ForbiddenError} Si no tiene acceso
 * @throws {NotFoundError} Si el permiso no existe
 */
export declare const updatePermiso: (permisoId: UUID, organizationId: UUID, data: UpdatePermisoDTO, requestingUserId: UUID) => Promise<Permiso>;
//# sourceMappingURL=permiso.service.d.ts.map