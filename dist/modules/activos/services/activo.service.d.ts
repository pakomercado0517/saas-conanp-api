import type { UUID } from '../../../shared/database/types.js';
import { Activo } from '../../../modules/activos/models/activo.model.js';
import type { CreateActivoDTO, UpdateActivoDTO, ListActivosDTO } from '../../../modules/activos/validators/activo.validator.js';
import type { PaginationMeta } from '../../../shared/responses/types.js';
/**
 * Tipo para estados de activo
 */
export type ActivoStatus = 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido';
/**
 * Valida que una transición de estado sea válida según las reglas de negocio.
 *
 * Transiciones válidas:
 * - pendiente → aprobado, rechazado
 * - aprobado → suspendido
 * - rechazado → pendiente
 * - suspendido → aprobado
 *
 * @param currentStatus - Estado actual del activo
 * @param newStatus - Nuevo estado deseado
 * @throws {ValidationError} Si la transición no es válida
 */
export declare const validateEstadoTransition: (currentStatus: ActivoStatus, newStatus: ActivoStatus) => void;
/**
 * Valida que un activo esté aprobado y pueda usarse.
 * Esta función se exporta para uso en otros services (ej: eventos operativos).
 *
 * @param activoId - ID del activo
 * @param organizationId - ID de la organización (multi-tenant)
 * @returns Activo aprobado
 * @throws {NotFoundError} Si el activo no existe o no pertenece a la organización
 * @throws {ValidationError} Si el activo no está aprobado
 */
export declare const validateActivoAprobado: (activoId: UUID, areaId: UUID) => Promise<Activo>;
/**
 * Crea un nuevo activo.
 *
 * @param data - Datos del activo
 * @param organizationId - ID de la organización (multi-tenant)
 * @param creatorUserId - ID del usuario que crea
 * @returns Activo creado con relaciones Organization y Owner cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el prestador no existe o no pertenece a la organización
 * @throws {ValidationError} Si el organizationId del data no coincide con el parámetro
 */
export declare const createActivo: (data: CreateActivoDTO, organizationId: UUID, creatorUserId: UUID) => Promise<Activo>;
/**
 * Obtiene un activo por ID.
 *
 * @param activoId - ID del activo
 * @param organizationId - ID de la organización (multi-tenant)
 * @param requestingUserId - ID del usuario que solicita
 * @returns Activo encontrado con relaciones Organization y Owner cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el activo no existe o no pertenece a la organización
 */
export declare const getActivoById: (activoId: UUID, organizationId: UUID, requestingUserId: UUID) => Promise<Activo>;
/**
 * Lista activos con paginación y filtros.
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros de paginación y búsqueda
 * @param requestingUserId - ID del usuario que solicita
 * @returns Datos paginados de activos con relaciones Organization y Owner cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 */
export declare const listActivos: (organizationId: UUID, filters: ListActivosDTO, requestingUserId: UUID) => Promise<{
    data: Activo[];
    pagination: PaginationMeta;
}>;
/**
 * Actualiza el estado de un activo con validación de transiciones.
 *
 * @param activoId - ID del activo
 * @param organizationId - ID de la organización (multi-tenant)
 * @param newStatus - Nuevo estado deseado
 * @param requestingUserId - ID del usuario que actualiza
 * @returns Activo actualizado con relaciones Organization y Owner cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el activo no existe o no pertenece a la organización
 * @throws {ValidationError} Si la transición de estado no es válida
 */
export declare const updateActivoStatus: (activoId: UUID, organizationId: UUID, newStatus: ActivoStatus, requestingUserId: UUID) => Promise<Activo>;
/**
 * Actualiza un activo (type y/o status).
 * Valida transiciones de estado cuando se actualiza status.
 *
 * @param activoId - ID del activo
 * @param organizationId - ID de la organización (multi-tenant)
 * @param data - Datos a actualizar (type y/o status)
 * @param requestingUserId - ID del usuario que actualiza
 * @returns Activo actualizado con relaciones Organization y Owner cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el activo no existe o no pertenece a la organización
 * @throws {ValidationError} Si la transición de estado no es válida
 */
export declare const updateActivo: (activoId: UUID, organizationId: UUID, data: UpdateActivoDTO, requestingUserId: UUID) => Promise<Activo>;
/**
 * Elimina un activo (soft delete).
 *
 * @param activoId - ID del activo
 * @param organizationId - ID de la organización (multi-tenant)
 * @param requestingUserId - ID del usuario que elimina
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el activo no existe o no pertenece a la organización
 */
export declare const deleteActivo: (activoId: UUID, organizationId: UUID, requestingUserId: UUID) => Promise<void>;
//# sourceMappingURL=activo.service.d.ts.map