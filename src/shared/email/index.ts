/**
 * Módulo de email - Brevo (Sendinblue)
 *
 * Servicio de envío de correos transaccionales para:
 * - Verificación de email
 * - Recuperación de contraseña
 * - Notificación de cambio de contraseña
 */

export { sendEmail, getSender, validateBrevoConfig } from './client.js';
export {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  buildVerificationUrl,
  buildPasswordResetUrl,
} from './email.service.js';
export type {
  BrevoConfig,
  VerificationEmailParams,
  PasswordResetEmailParams,
  PasswordChangedEmailParams,
} from './types.js';
