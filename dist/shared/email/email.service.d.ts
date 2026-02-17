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
//# sourceMappingURL=email.service.d.ts.map