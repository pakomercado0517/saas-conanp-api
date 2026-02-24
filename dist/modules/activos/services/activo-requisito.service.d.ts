import type { UUID } from '@/shared/database/types.js';
import { ActivoRequisito } from '@/modules/activos/models/activo-requisito.model.js';
import type { CreateActivoRequisitoDTO, UpdateActivoRequisitoDTO, ListActivoRequisitosDTO } from '@/modules/activos/validators/activo.validator.js';
import type { PaginationMeta } from '@/shared/responses/types.js';
/**
 * Crea un requisito de activo.
 *
 * @param data - Datos del requisito
 * @param organizationId - ID de la organización (multi-tenant)
 * @param requestingUserId - ID del usuario que crea
 * @returns ActivoRequisito creado con relación Activo cargada
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el activo no existe o no pertenece a la organización
 * @throws {ValidationError} Si ya existe un requisito con la misma clave para el activo
 */
export declare const createRequisito: (data: CreateActivoRequisitoDTO, organizationId: UUID, requestingUserId: UUID) => Promise<ActivoRequisito>;
/**
 * Lista requisitos de un activo con paginación y filtros.
 *
 * @param activoId - ID del activo
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros de paginación y búsqueda
 * @param requestingUserId - ID del usuario que solicita
 * @returns Datos paginados de requisitos con relación Activo cargada
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el activo no existe o no pertenece a la organización
 */
export declare const listRequisitosByActivo: (activoId: UUID, organizationId: UUID, filters: ListActivoRequisitosDTO, requestingUserId: UUID) => Promise<{
    data: ActivoRequisito[];
    pagination: PaginationMeta;
}>;
/**
 * Actualiza un requisito de activo.
 * Solo se pueden actualizar value, documentUrl y validated (no key).
 *
 * @param requisitoId - ID del requisito
 * @param organizationId - ID de la organización (multi-tenant)
 * @param data - Datos a actualizar
 * @param requestingUserId - ID del usuario que actualiza
 * @returns ActivoRequisito actualizado con relación Activo cargada
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el requisito no existe o su activo no pertenece a la organización
 */
export declare const updateRequisito: (requisitoId: UUID, organizationId: UUID, data: UpdateActivoRequisitoDTO, requestingUserId: UUID) => Promise<ActivoRequisito>;
/**
 * Elimina un requisito de activo (hard delete).
 *
 * @param requisitoId - ID del requisito
 * @param organizationId - ID de la organización (multi-tenant)
 * @param requestingUserId - ID del usuario que elimina
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el requisito no existe o su activo no pertenece a la organización
 */
export declare const deleteRequisito: (requisitoId: UUID, organizationId: UUID, requestingUserId: UUID) => Promise<void>;
//# sourceMappingURL=activo-requisito.service.d.ts.map