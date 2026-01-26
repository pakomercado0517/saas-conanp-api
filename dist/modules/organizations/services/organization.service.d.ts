import type { UUID } from '../../../shared/database/types';
import { Organization } from '../../../modules/organizations/models/organization.model';
import type { CreateOrganizationDTO, UpdateOrganizationDTO, ListOrganizationsDTO } from '../../../modules/organizations/validators/organization.validator';
import type { PaginationMeta } from '../../../shared/responses/types';
/**
 * Valida que el usuario tenga acceso a la organización.
 * Verifica membresía activa (userId + organizationId, status 'activo').
 *
 * @throws {ForbiddenError} Si no existe membresía activa
 */
export declare const assertCanAccessOrganization: (userId: UUID, organizationId: UUID) => Promise<void>;
/**
 * Crea una nueva organización.
 * No requiere validación de acceso (no hay organización previa).
 */
export declare const createOrganization: (data: CreateOrganizationDTO) => Promise<Organization>;
/**
 * Obtiene una organización por ID.
 * Filtro multi-tenant: solo si el usuario tiene acceso vía membresía activa.
 */
export declare const getOrganizationById: (organizationId: UUID, userId: UUID) => Promise<Organization>;
/**
 * Lista organizaciones con paginación y filtros.
 * Filtro multi-tenant obligatorio: solo organizaciones donde el usuario tiene membresía activa.
 */
export declare const listOrganizations: (filters: ListOrganizationsDTO, userId: UUID) => Promise<{
    data: Organization[];
    pagination: PaginationMeta;
}>;
/**
 * Actualiza una organización.
 * Filtro multi-tenant: solo si el usuario tiene acceso.
 */
export declare const updateOrganization: (organizationId: UUID, data: UpdateOrganizationDTO, userId: UUID) => Promise<Organization>;
/**
 * Elimina una organización (soft delete).
 * Filtro multi-tenant: solo si el usuario tiene acceso.
 */
export declare const deleteOrganization: (organizationId: UUID, userId: UUID) => Promise<void>;
//# sourceMappingURL=organization.service.d.ts.map