import type { UUID } from '../../../shared/database/types.js';
import { PrestadorProfile } from '../../../modules/prestadores/models/prestador-profile.model.js';
import { Membership } from '../../../modules/users/models/membership.model.js';
import type { CreatePrestadorProfileDTO, UpdatePrestadorProfileDTO, ListPrestadoresDTO } from '../../../modules/prestadores/validators/prestador-profile.validator.js';
import type { PaginationMeta } from '../../../shared/responses/types.js';
/**
 * Valida que el usuario tenga una membership activa en la organización.
 *
 * @param userId - ID del usuario a validar
 * @param organizationId - ID de la organización
 * @returns Membership encontrada
 * @throws {ForbiddenError} Si no tiene membership activa en la organización
 */
export declare const validateUserMembership: (userId: UUID, organizationId: UUID) => Promise<Membership>;
/**
 * Valida los permisos para acceder a un perfil de prestador.
 * - Los administradores pueden ver/editar cualquier perfil
 * - Los prestadores solo pueden ver/editar su propio perfil
 *
 * @param requestingUserId - ID del usuario que solicita acceso
 * @param profileUserId - ID del usuario del perfil de prestador
 * @param organizationId - ID de la organización
 * @throws {ForbiddenError} Si no tiene permisos para acceder al perfil
 */
export declare const validatePrestadorPermissions: (requestingUserId: UUID, profileUserId: UUID, organizationId: UUID) => Promise<void>;
/**
 * Crea un nuevo perfil de prestador.
 * Requiere que el usuario tenga membership activa en la organización.
 * Solo los administradores pueden crear perfiles de prestador.
 *
 * @param data - Datos del perfil de prestador
 * @param creatorUserId - ID del usuario que crea (debe tener membership activa)
 * @returns PrestadorProfile creado con relaciones User y Organization
 * @throws {ForbiddenError} Si no tiene acceso a la organización o no es admin
 * @throws {NotFoundError} Si la organización o usuario no existen
 * @throws {ConflictError} Si ya existe un perfil para ese usuario en esa organización
 * @throws {ValidationError} Si el usuario no tiene membership activa
 */
export declare const createPrestadorProfile: (data: CreatePrestadorProfileDTO, creatorUserId: UUID) => Promise<PrestadorProfile>;
/**
 * Obtiene un perfil de prestador por ID.
 * - Los administradores pueden ver cualquier perfil
 * - Los prestadores solo pueden ver su propio perfil
 *
 * @param profileId - ID del perfil de prestador
 * @param organizationId - ID de la organización (multi-tenant)
 * @param requestingUserId - ID del usuario que solicita
 * @returns PrestadorProfile encontrado con relaciones User y Organization
 * @throws {ForbiddenError} Si no tiene acceso a la organización o no tiene permisos
 * @throws {NotFoundError} Si el perfil no existe o no pertenece a la organización
 */
export declare const getPrestadorProfileById: (profileId: UUID, organizationId: UUID, requestingUserId: UUID) => Promise<PrestadorProfile>;
/**
 * Lista prestadores con paginación y filtros.
 * - Los administradores pueden ver todos los prestadores
 * - Los prestadores solo pueden ver su propio perfil
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros de paginación, ordenamiento y filtros
 * @param requestingUserId - ID del usuario que solicita
 * @returns Datos paginados de prestadores con relaciones User y Organization
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 */
export declare const listPrestadores: (organizationId: UUID, filters: ListPrestadoresDTO, requestingUserId: UUID) => Promise<{
    data: PrestadorProfile[];
    pagination: PaginationMeta;
}>;
/**
 * Actualiza un perfil de prestador existente.
 * - Los administradores pueden actualizar cualquier perfil
 * - Los prestadores solo pueden actualizar su propio perfil
 *
 * @param profileId - ID del perfil a actualizar
 * @param organizationId - ID de la organización (multi-tenant)
 * @param data - Datos a actualizar
 * @param requestingUserId - ID del usuario que actualiza
 * @returns PrestadorProfile actualizado con relaciones User y Organization
 * @throws {ForbiddenError} Si no tiene acceso o no tiene permisos
 * @throws {NotFoundError} Si el perfil no existe o no pertenece a la organización
 */
export declare const updatePrestadorProfile: (profileId: UUID, organizationId: UUID, data: UpdatePrestadorProfileDTO, requestingUserId: UUID) => Promise<PrestadorProfile>;
//# sourceMappingURL=prestador-profile.service.d.ts.map