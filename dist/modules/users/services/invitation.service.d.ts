import type { UUID } from '@/shared/database/types.js';
import { Invitation } from '@/modules/users/models/invitation.model.js';
import type { CreateInvitationDTO, ListInvitationsDTO } from '@/modules/users/validators/invitation.validator.js';
import type { PaginationMeta } from '@/shared/responses/types.js';
export interface CreateInvitationResult {
    id: UUID;
    email: string;
    role: CreateInvitationDTO['role'];
    expiresAt: Date;
    status: 'pending';
}
/**
 * Crea una invitación y envía el email con enlace y token manual.
 * Solo admins. Valida límite de usuarios y evita duplicados (pending) por org+email.
 */
export declare const createInvitation: (areaId: UUID, data: CreateInvitationDTO, invitedByUserId: UUID) => Promise<CreateInvitationResult>;
/**
 * Lista invitaciones de una organización con paginación y filtro por estado.
 */
export declare const listInvitations: (areaId: UUID, filters: ListInvitationsDTO, userId: UUID) => Promise<{
    data: Invitation[];
    pagination: PaginationMeta;
}>;
/**
 * Revoca una invitación (solo admins). Establece status revoked y revokedAt.
 */
export declare const revokeInvitation: (areaId: UUID, invitationId: UUID, userId: UUID) => Promise<void>;
export interface ValidateInvitationResult {
    valid: true;
    email: string;
    organizationId: UUID;
    organizationName: string;
    role: string;
    expiresAt: Date;
}
/**
 * Valida un token de invitación (para pre-registro en frontend).
 * No consume la invitación; solo comprueba que sea válida.
 */
export declare const validateInvitationToken: (invitationId: UUID, token: string) => Promise<ValidateInvitationResult>;
export interface ConsumeInvitationResult {
    organizationId: UUID;
    role: Invitation['role'];
}
/**
 * Consume una invitación al completar el registro: valida token y email, marca invitación como usada.
 * Debe llamarse antes de crear el usuario. Revalida límite de usuarios del plan.
 */
export declare const consumeInvitationForRegistration: (invitationId: UUID, token: string, email: string) => Promise<ConsumeInvitationResult>;
/**
 * Consume una invitaci?n tras haber validado la prueba de email (flujo invitation_code).
 * Requiere que exista un InvitationEmailProof ya usado (usedAt no null) para esta invitaci?n y email.
 */
export declare const consumeInvitationAfterProof: (invitationId: UUID, email: string) => Promise<ConsumeInvitationResult>;
//# sourceMappingURL=invitation.service.d.ts.map