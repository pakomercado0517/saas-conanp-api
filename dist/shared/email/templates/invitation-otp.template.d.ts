/**
 * Parámetros para el email de OTP de verificación de invitación (código manual)
 */
export interface InvitationOtpEmailParams {
    to: string;
    organizationName: string;
    otp: string;
    expiresInMinutes: number;
}
/**
 * Plantilla para email con código OTP (verificación de email para registro por código de invitación)
 */
export declare const getInvitationOtpEmailContent: (params: InvitationOtpEmailParams) => {
    html: string;
    text: string;
};
//# sourceMappingURL=invitation-otp.template.d.ts.map