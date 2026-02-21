/**
 * Parámetros para el email de invitación a organización
 */
export interface InvitationEmailParams {
    to: string;
    organizationName: string;
    role: string;
    invitationUrl: string;
    /** Token en texto para copiar manualmente si falla el enlace */
    tokenManual: string;
    invitedBy: string;
    expiresIn: string;
}
/**
 * Plantilla para email de invitación a organización.
 * Incluye enlace con token y token visible para fallback manual.
 */
export declare const getInvitationEmailContent: (params: InvitationEmailParams) => {
    html: string;
    text: string;
};
//# sourceMappingURL=invitation.template.d.ts.map