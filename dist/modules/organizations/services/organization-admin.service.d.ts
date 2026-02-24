import type { UUID } from '../../../shared/database/types';
import { Area } from '../../../modules/areas/models/area.model.js';
import type { CreateOrganizationDTO, UpdateOrganizationDTO, ListOrganizationsDTO } from '../../../modules/organizations/validators/organization.validator';
import type { PaginationMeta } from '../../../shared/responses/types';
type AdminAssignment = 'membership_created' | 'invitation_created';
export interface CreateOrganizationAdminResult extends Record<string, unknown> {
    adminAssignment: AdminAssignment;
    adminEmail: string;
    membershipId?: UUID;
    invitationId?: UUID;
}
/**
 * Crea una nueva organización (super admin).
 */
export declare const createOrganization: (data: CreateOrganizationDTO, actor: {
    userId: UUID;
    email: string;
}) => Promise<CreateOrganizationAdminResult>;
/**
 * Lista todas las áreas con paginación y filtros (super admin).
 * Incluye suscripción vía dependencia.
 */
export declare const listAllOrganizations: (filters: ListOrganizationsDTO) => Promise<{
    data: Area[];
    pagination: PaginationMeta;
}>;
/**
 * Obtiene un área por ID con info de suscripción (vía dependencia) y miembros.
 */
export declare const getOrganizationById: (areaId: UUID) => Promise<Area>;
/**
 * Actualiza un área sin validar membresía ni suscripción (super admin).
 */
export declare const updateOrganization: (areaId: UUID, data: UpdateOrganizationDTO) => Promise<Area>;
/**
 * Elimina un área (soft delete) sin validar membresía ni suscripción (super admin).
 */
export declare const deleteOrganization: (areaId: UUID) => Promise<void>;
export {};
//# sourceMappingURL=organization-admin.service.d.ts.map