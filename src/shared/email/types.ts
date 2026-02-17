/**
 * Tipos para el módulo de email (Brevo)
 */

/**
 * Configuración de Brevo
 */
export interface BrevoConfig {
  /** API Key de Brevo. No exponer en logs ni respuestas. */
  apiKey: string;
  /** Email del remitente */
  senderEmail: string;
  /** Nombre del remitente */
  senderName: string;
}

/**
 * Parámetros para enviar email de verificación
 */
export interface VerificationEmailParams {
  /** Email del destinatario */
  to: string;
  /** Nombre del destinatario */
  name: string;
  /** URL completa para verificar el correo (incluye token) */
  verifyUrl: string;
}

/**
 * Parámetros para enviar email de recuperación de contraseña
 */
export interface PasswordResetEmailParams {
  /** Email del destinatario */
  to: string;
  /** Nombre del destinatario */
  name: string;
  /** URL completa para restablecer contraseña (incluye token) */
  resetUrl: string;
}

/**
 * Parámetros para enviar email de notificación de cambio de contraseña
 */
export interface PasswordChangedEmailParams {
  /** Email del destinatario */
  to: string;
  /** Nombre del destinatario */
  name: string;
}
