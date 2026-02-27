import type { UUID } from '../../../shared/database/types.js';
export interface CreateOnboardingInvitationResult {
    id: UUID;
    email: string;
    status: string;
    expiresAt: Date;
}
export interface ValidateOnboardingInvitationResult {
    valid: true;
    email: string;
    expiresAt: Date;
    type: 'onboarding';
}
export interface ConsumeOnboardingInvitationResult {
    type: 'onboarding';
}
/**
 * Crea o regenera una invitación de onboarding para el email indicado.
 * No crea dependencia ni área; solo envía el enlace de registro.
 */
export declare const createOnboardingInvitation: (email: string, invitedByUserId: UUID, invitedByEmail: string) => Promise<CreateOnboardingInvitationResult>;
/**
 * Valida un token de invitación de onboarding para pre-registro en frontend.
 * No modifica la invitación.
 */
export declare const validateOnboardingInvitationToken: (invitationId: UUID, token: string) => Promise<ValidateOnboardingInvitationResult>;
/**
 * Consume invitación de onboarding en flujo de registro.
 * Marca la invitación como aceptada y valida email/token.
 */
export declare const consumeOnboardingInvitationForRegistration: (invitationId: UUID, token: string, email: string) => Promise<ConsumeOnboardingInvitationResult>;
//# sourceMappingURL=onboarding-invitation.service.d.ts.map