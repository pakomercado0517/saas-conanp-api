import type { VerificationEmailParams } from '../types.js';

/**
 * Plantilla básica para email de verificación de cuenta
 * Los estilos se actualizarán cuando tengamos el diseño definitivo
 */
export const getVerificationEmailContent = (
  params: VerificationEmailParams
): { html: string; text: string } => {
  const { name, verifyUrl } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; padding: 40px;">
          <tr>
            <td>
              <h1 style="margin: 0 0 20px 0; font-size: 24px; color: #333;">Verifica tu correo electrónico</h1>
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #555; line-height: 1.5;">
                Hola ${name},
              </p>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #555; line-height: 1.5;">
                Gracias por registrarte. Para activar tu cuenta, haz clic en el siguiente enlace:
              </p>
              <p style="margin: 0 0 24px 0;">
                <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Verificar mi correo
                </a>
              </p>
              <p style="margin: 0; font-size: 14px; color: #777; line-height: 1.5;">
                Si no creaste esta cuenta, puedes ignorar este correo.
              </p>
              <p style="margin: 24px 0 0 0; font-size: 12px; color: #999;">
                Este enlace expira en 24 horas.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  const text = `
Verifica tu correo electrónico

Hola ${name},

Gracias por registrarte. Para activar tu cuenta, visita el siguiente enlace:

${verifyUrl}

Si no creaste esta cuenta, puedes ignorar este correo.

Este enlace expira en 24 horas.
`.trim();

  return { html, text };
};
