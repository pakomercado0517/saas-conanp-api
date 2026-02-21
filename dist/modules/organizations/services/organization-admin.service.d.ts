import type { UUID } from '../../../shared/database/types';
import { Organization } from '../../../modules/organizations/models/organization.model';
import type { CreateOrganizationDTO, UpdateOrganizationDTO, ListOrganizationsDTO } from '../../../modules/organizations/validators/organization.validator';
import type { PaginationMeta } from '../../../shared/responses/types';
/**
 * Crea una nueva organización (super admin).
 */
export declare const createOrganization: (data: CreateOrganizationDTO) => Promise<Organization>;
/**
 * Lista todas las organizaciones con paginación y filtros.
 * Sin filtro de membresía — el super admin ve todas.
 * Incluye estado de suscripción y conteo de miembros.
 */
export declare const listAllOrganizations: (filters: ListOrganizationsDTO) => Promise<{
    data: Organization[];
    pagination: PaginationMeta;
}>;
/**
 * Obtiene una organización por ID con info de suscripción y miembros.
 * Sin validación de membresía — acceso directo para super admin.
 */
export declare const getOrganizationById: (organizationId: UUID) => Promise<Organization>;
/**
 * Actualiza una organización sin validar membresía ni suscripción.
 */
export declare const updateOrganization: (organizationId: UUID, data: UpdateOrganizationDTO) => Promise<Organization>;
/**
 * Elimina una organización (soft delete) sin validar membresía ni suscripción.
 */
export declare const deleteOrganization: (organizationId: UUID) => Promise<void>;
//# sourceMappingURL=organization-admin.service.d.ts.map