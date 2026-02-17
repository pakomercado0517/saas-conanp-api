import type { PasswordChangedEmailParams } from '../types.js';

/**
 * Plantilla básica para notificación de cambio de contraseña
 * Los estilos se actualizarán cuando tengamos el diseño definitivo
 */
export const getPasswordChangedEmailContent = (
  params: PasswordChangedEmailParams
): { html: string; text: string } => {
  const { name } = params;

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
              <h1 style="margin: 0 0 20px 0; font-size: 24px; color: #333;">Contraseña actualizada</h1>
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #555; line-height: 1.5;">
                Hola ${name},
              </p>
              <p style="margin: 0; font-size: 16px; color: #555; line-height: 1.5;">
                Tu contraseña ha sido cambiada correctamente. Si no realizaste este cambio, contacta a soporte de inmediato.
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
Contraseña actualizada

Hola ${name},

Tu contraseña ha sido cambiada correctamente. Si no realizaste este cambio, contacta a soporte de inmediato.
`.trim();

  return { html, text };
};
