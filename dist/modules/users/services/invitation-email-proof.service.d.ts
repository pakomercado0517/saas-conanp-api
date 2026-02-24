import type { UUID } from '../../../shared/database/types';
/**
 * Inicia el flujo de verificación de email para registro por código manual.
 * Valida la invitación, crea un proof con OTP y envía el OTP por correo.
 */
export declare const startVerifyEmail: (invitationId: UUID, email: string) => Promise<{
    message: string;
}>;
export interface ConfirmVerifyEmailResult {
    invitationProof: string;
    invitationId: UUID;
    email: string;
    expiresAt: Date;
}
/**
 * Confirma el OTP y emite un proof token para usar en el registro (invitation_code).
 */
export declare const confirmVerifyEmail: (invitationId: UUID, email: string, otp: string) => Promise<ConfirmVerifyEmailResult>;
export interface ConsumeProofResult {
    organizationId: UUID;
    role: string;
}
/**
 * Consume un proof token (single-use) y devuelve los datos de la invitación para completar el registro.
 * Marca el proof como usado.
 */
export declare const consumeProofForRegistration: (invitationId: UUID, email: string, invitationProof: string) => Promise<ConsumeProofResult>;
//# sourceMappingURL=invitation-email-proof.service.d.ts.map