import { sendEmail } from './client.js';
import { getVerificationEmailContent, getPasswordResetEmailContent, getPasswordChangedEmailContent, getInvitationEmailContent, getInvitationOtpEmailContent, } from './templates/index.js';
import { logger } from '@/shared/logger/index.js';
/** URL base del frontend para construir enlaces (ej: http://localhost:3000) */
const FRONTEND_URL = process.env['FRONTEND_URL'] ?? 'http://localhost:3000';
/** Días de validez de una invitación (solo para texto en email) */
const INVITATION_EXPIRES_DAYS_TEXT = '7 días';
/**
 * Construye la URL de verificación de email
 * El frontend debe tener una ruta que reciba el token y llame al backend
 */
export const buildVerificationUrl = (token) => {
    return `${FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;
};
/**
 * Construye la URL de restablecimiento de contraseña
 */
export const buildPasswordResetUrl = (token) => {
    return `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
};
/**
 * Construye la URL de registro con invitación (invitationId + token en query)
 */
export const buildInvitationUrl = (invitationId, token) => {
    return `${FRONTEND_URL}/register?invitationId=${encodeURIComponent(invitationId)}&token=${encodeURIComponent(token)}`;
};
/**
 * Envía email de verificación de cuenta
 *
 * @param params - Destinatario, nombre y token para construir la URL
 * @returns messageId del correo enviado
 */
export const sendVerificationEmail = async (params) => {
    const verifyUrl = buildVerificationUrl(params.token);
    const { html, text } = getVerificationEmailContent({
        to: params.to,
        name: params.name,
        verifyUrl,
    });
    const messageId = await sendEmail({
        to: [{ email: params.to, name: params.name }],
        subject: 'Verifica tu correo electrónico',
        htmlContent: html,
        textContent: text,
        tags: ['verification', 'auth'],
    });
    logger.info({ to: params.to, messageId }, 'Email de verificación enviado');
    return messageId;
};
/**
 * Envía email de recuperación de contraseña
 *
 * @param params - Destinatario, nombre y token para construir la URL
 * @returns messageId del correo enviado
 */
export const sendPasswordResetEmail = async (params) => {
    const resetUrl = buildPasswordResetUrl(params.token);
    const { html, text } = getPasswordResetEmailContent({
        to: params.to,
        name: params.name,
        resetUrl,
    });
    const messageId = await sendEmail({
        to: [{ email: params.to, name: params.name }],
        subject: 'Restablece tu contraseña',
        htmlContent: html,
        textContent: text,
        tags: ['password-reset', 'auth'],
    });
    logger.info({ to: params.to, messageId }, 'Email de recuperación de contraseña enviado');
    return messageId;
};
/**
 * Envía email de notificación cuando el usuario cambió su contraseña
 *
 * @param params - Destinatario y nombre
 * @returns messageId del correo enviado
 */
export const sendPasswordChangedEmail = async (params) => {
    const { html, text } = getPasswordChangedEmailContent(params);
    const messageId = await sendEmail({
        to: [{ email: params.to, name: params.name }],
        subject: 'Tu contraseña ha sido actualizada',
        htmlContent: html,
        textContent: text,
        tags: ['password-changed', 'auth'],
    });
    logger.info({ to: params.to, messageId }, 'Email de cambio de contraseña enviado');
    return messageId;
};
/**
 * Envía email de invitación a organización con enlace y token manual de fallback.
 */
export const sendInvitationEmail = async (params) => {
    const invitationUrl = buildInvitationUrl(params.invitationId, params.token);
    const { html, text } = getInvitationEmailContent({
        to: params.to,
        organizationName: params.organizationName,
        role: params.role,
        invitationUrl,
        tokenManual: params.token,
        invitedBy: params.invitedBy,
        expiresIn: INVITATION_EXPIRES_DAYS_TEXT,
    });
    const messageId = await sendEmail({
        to: [{ email: params.to }],
        subject: `Invitación a ${params.organizationName}`,
        htmlContent: html,
        textContent: text,
        tags: ['invitation', 'organization'],
    });
    logger.info({ to: params.to, organizationName: params.organizationName, messageId }, 'Email de invitación enviado');
    return messageId;
};
/** OTP expiration for invitation email proof (minutes) */
const INVITATION_OTP_EXPIRES_MINUTES = 10;
/**
 * Envía email con código OTP para verificar email en flujo de invitación por código manual.
 */
export const sendInvitationOtpEmail = async (params) => {
    const { html, text } = getInvitationOtpEmailContent({
        to: params.to,
        organizationName: params.organizationName,
        otp: params.otp,
        expiresInMinutes: INVITATION_OTP_EXPIRES_MINUTES,
    });
    const messageId = await sendEmail({
        to: [{ email: params.to }],
        subject: 'Código de verificación para tu registro',
        htmlContent: html,
        textContent: text,
        tags: ['invitation', 'otp', 'verification'],
    });
    logger.info({ to: params.to, messageId }, 'Email OTP invitación enviado');
    return messageId;
};
export { INVITATION_OTP_EXPIRES_MINUTES };
//# sourceMappingURL=email.service.js.map