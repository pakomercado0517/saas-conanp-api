import type { PasswordResetEmailParams } from '../types.js';

/**
 * Plantilla básica para email de recuperación de contraseña
 * Los estilos se actualizarán cuando tengamos el diseño definitivo
 */
export const getPasswordResetEmailContent = (
  params: PasswordResetEmailParams
): { html: string; text: string } => {
  const { name, resetUrl } = params;

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
              <h1 style="margin: 0 0 20px 0; font-size: 24px; color: #333;">Restablece tu contraseña</h1>
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #555; line-height: 1.5;">
                Hola ${name},
              </p>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #555; line-height: 1.5;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el siguiente enlace para crear una nueva contraseña:
              </p>
              <p style="margin: 0 0 24px 0;">
                <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Restablecer contraseña
                </a>
              </p>
              <p style="margin: 0; font-size: 14px; color: #777; line-height: 1.5;">
                Si no solicitaste este cambio, ignora este correo. Tu contraseña permanecerá sin cambios.
              </p>
              <p style="margin: 24px 0 0 0; font-size: 12px; color: #999;">
                Este enlace expira en 1 hora por razones de seguridad.
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
Restablece tu contraseña

Hola ${name},

Recibimos una solicitud para restablecer la contraseña de tu cuenta. Visita el siguiente enlace para crear una nueva contraseña:

${resetUrl}

Si no solicitaste este cambio, ignora este correo. Tu contraseña permanecerá sin cambios.

Este enlace expira en 1 hora por razones de seguridad.
`.trim();

  return { html, text };
};
