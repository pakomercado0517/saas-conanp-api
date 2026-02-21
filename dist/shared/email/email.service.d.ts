import type { VerificationEmailParams, PasswordResetEmailParams, PasswordChangedEmailParams } from './types.js';
/**
 * Construye la URL de verificación de email
 * El frontend debe tener una ruta que reciba el token y llame al backend
 */
export declare const buildVerificationUrl: (token: string) => string;
/**
 * Construye la URL de restablecimiento de contraseña
 */
export declare const buildPasswordResetUrl: (token: string) => string;
/**
 * Construye la URL de registro con invitación (invitationId + token en query)
 */
export declare const buildInvitationUrl: (invitationId: string, token: string) => string;
/**
 * Envía email de verificación de cuenta
 *
 * @param params - Destinatario, nombre y token para construir la URL
 * @returns messageId del correo enviado
 */
export declare const sendVerificationEmail: (params: Omit<VerificationEmailParams, "verifyUrl"> & {
    token: string;
}) => Promise<string>;
/**
 * Envía email de recuperación de contraseña
 *
 * @param params - Destinatario, nombre y token para construir la URL
 * @returns messageId del correo enviado
 */
export declare const sendPasswordResetEmail: (params: Omit<PasswordResetEmailParams, "resetUrl"> & {
    token: string;
}) => Promise<string>;
/**
 * Envía email de notificación cuando el usuario cambió su contraseña
 *
 * @param params - Destinatario y nombre
 * @returns messageId del correo enviado
 */
export declare const sendPasswordChangedEmail: (params: PasswordChangedEmailParams) => Promise<string>;
export interface SendInvitationEmailParams {
    to: string;
    organizationName: string;
    role: string;
    invitationId: string;
    token: string;
    invitedBy: string;
}
/**
 * Envía email de invitación a organización con enlace y token manual de fallback.
 */
export declare const sendInvitationEmail: (params: SendInvitationEmailParams) => Promise<string>;
//# sourceMappingURL=email.service.d.ts.map