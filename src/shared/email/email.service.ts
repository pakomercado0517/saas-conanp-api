import { sendEmail } from './client.js';
import {
  getVerificationEmailContent,
  getPasswordResetEmailContent,
  getPasswordChangedEmailContent,
} from './templates/index.js';
import type {
  VerificationEmailParams,
  PasswordResetEmailParams,
  PasswordChangedEmailParams,
} from './types.js';
import { logger } from '@/shared/logger/index.js';

/** URL base del frontend para construir enlaces (ej: http://localhost:3000) */
const FRONTEND_URL = process.env['FRONTEND_URL'] ?? 'http://localhost:3000';

/**
 * Construye la URL de verificación de email
 * El frontend debe tener una ruta que reciba el token y llame al backend
 */
export const buildVerificationUrl = (token: string): string => {
  return `${FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;
};

/**
 * Construye la URL de restablecimiento de contraseña
 */
export const buildPasswordResetUrl = (token: string): string => {
  return `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
};

/**
 * Envía email de verificación de cuenta
 *
 * @param params - Destinatario, nombre y token para construir la URL
 * @returns messageId del correo enviado
 */
export const sendVerificationEmail = async (
  params: Omit<VerificationEmailParams, 'verifyUrl'> & { token: string }
): Promise<string> => {
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

  logger.info(
    { to: params.to, messageId },
    'Email de verificación enviado'
  );

  return messageId;
};

/**
 * Envía email de recuperación de contraseña
 *
 * @param params - Destinatario, nombre y token para construir la URL
 * @returns messageId del correo enviado
 */
export const sendPasswordResetEmail = async (
  params: Omit<PasswordResetEmailParams, 'resetUrl'> & { token: string }
): Promise<string> => {
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

  logger.info(
    { to: params.to, messageId },
    'Email de recuperación de contraseña enviado'
  );

  return messageId;
};

/**
 * Envía email de notificación cuando el usuario cambió su contraseña
 *
 * @param params - Destinatario y nombre
 * @returns messageId del correo enviado
 */
export const sendPasswordChangedEmail = async (
  params: PasswordChangedEmailParams
): Promise<string> => {
  const { html, text } = getPasswordChangedEmailContent(params);

  const messageId = await sendEmail({
    to: [{ email: params.to, name: params.name }],
    subject: 'Tu contraseña ha sido actualizada',
    htmlContent: html,
    textContent: text,
    tags: ['password-changed', 'auth'],
  });

  logger.info(
    { to: params.to, messageId },
    'Email de cambio de contraseña enviado'
  );

  return messageId;
};
