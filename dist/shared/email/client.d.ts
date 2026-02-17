import { TransactionalEmailsApi } from '@getbrevo/brevo';
/**
 * Cliente de Brevo para envío de correos transaccionales
 */
declare const transactionalEmailsApi: TransactionalEmailsApi;
/**
 * Obtiene el remitente configurado
 */
export declare const getSender: () => {
    email: string;
    name: string;
};
/**
 * Envía un correo usando la API de Brevo
 *
 * @param options - Opciones del correo (subject, htmlContent, textContent, to)
 * @returns messageId del correo enviado
 */
export declare const sendEmail: (options: {
    to: {
        email: string;
        name?: string;
    }[];
    subject: string;
    htmlContent: string;
    textContent?: string;
    tags?: string[];
}) => Promise<string>;
/**
 * Verifica que la configuración de Brevo sea correcta
 * (no hace una llamada real a la API, solo valida las variables)
 */
export declare const validateBrevoConfig: () => boolean;
export { transactionalEmailsApi };
//# sourceMappingURL=client.d.ts.map