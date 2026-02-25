import type { UUID } from '../../../shared/database/types.js';
import { DependenciaInvitation } from '../../../modules/dependencias/models/dependencia-invitation.model.js';
import type { CreateDependenciaInvitationDTO, ListDependenciaInvitationsDTO } from '../validators/dependencia-invitation.validator.js';
import type { PaginationMeta } from '../../../shared/responses/types.js';
export interface CreateDependenciaInvitationResult {
    id: UUID;
    email: string;
    role: CreateDependenciaInvitationDTO['role'];
    expiresAt: Date;
    status: 'pending';
}
export declare const createDependenciaInvitation: (dependenciaId: UUID, data: CreateDependenciaInvitationDTO, invitedByUserId: UUID) => Promise<CreateDependenciaInvitationResult>;
export declare const listDependenciaInvitations: (dependenciaId: UUID, filters: ListDependenciaInvitationsDTO, userId: UUID) => Promise<{
    data: DependenciaInvitation[];
    pagination: PaginationMeta;
}>;
export declare const revokeDependenciaInvitation: (dependenciaId: UUID, invitationId: UUID, userId: UUID) => Promise<void>;
export interface ValidateDependenciaInvitationResult {
    valid: true;
    email: string;
    organizationId: UUID;
    organizationName: string;
    role: string;
    expiresAt: Date;
    type: 'dependencia';
}
export declare const validateDependenciaInvitationToken: (invitationId: UUID, token: string) => Promise<ValidateDependenciaInvitationResult>;
export interface ConsumeDependenciaInvitationResult {
    dependenciaId: UUID;
    role: string;
}
export declare const consumeDependenciaInvitationForRegistration: (invitationId: UUID, token: string, email: string) => Promise<ConsumeDependenciaInvitationResult>;
//# sourceMappingURL=dependencia-invitation.service.d.ts.map