import dotenv from 'dotenv';
import {
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
} from '@getbrevo/brevo';
import type { BrevoConfig } from './types.js';
import { logger } from '@/shared/logger/index.js';

dotenv.config();

/**
 * Valida y obtiene la configuración de Brevo desde variables de entorno
 */
const getConfig = (): BrevoConfig => {
  const apiKey = process.env['BREVO_API_KEY'];
  const senderEmail = process.env['BREVO_SENDER_EMAIL'];
  const senderName = process.env['BREVO_SENDER_NAME'] || 'CONANP';

  if (!apiKey) {
    throw new Error('BREVO_API_KEY no está definida en las variables de entorno');
  }

  if (!senderEmail) {
    throw new Error(
      'BREVO_SENDER_EMAIL no está definida en las variables de entorno'
    );
  }

  return {
    apiKey,
    senderEmail,
    senderName,
  };
};

const config = getConfig();

/**
 * Cliente de Brevo para envío de correos transaccionales
 */
const transactionalEmailsApi = new TransactionalEmailsApi();
transactionalEmailsApi.setApiKey(
  TransactionalEmailsApiApiKeys.apiKey,
  config.apiKey
);

/**
 * Obtiene el remitente configurado
 */
export const getSender = () => ({
  email: config.senderEmail,
  name: config.senderName,
});

/**
 * Envía un correo usando la API de Brevo
 *
 * @param options - Opciones del correo (subject, htmlContent, textContent, to)
 * @returns messageId del correo enviado
 */
export const sendEmail = async (options: {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  tags?: string[];
}): Promise<string> => {
  const { body } = await transactionalEmailsApi.sendTransacEmail({
    sender: getSender(),
    to: options.to,
    subject: options.subject,
    htmlContent: options.htmlContent,
    textContent: options.textContent ?? options.htmlContent.replace(/<[^>]*>/g, ''),
    ...(options.tags && { tags: options.tags }),
  });

  const messageId = body.messageId ?? 'unknown';
  return messageId;
};

/**
 * Verifica que la configuración de Brevo sea correcta
 * (no hace una llamada real a la API, solo valida las variables)
 */
export const validateBrevoConfig = (): boolean => {
  try {
    getConfig();
    logger.info(
      { senderEmail: config.senderEmail, senderName: config.senderName },
      'Configuración de Brevo validada'
    );
    return true;
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      'Error en configuración de Brevo'
    );
    return false;
  }
};

export { transactionalEmailsApi };
