/**
 * Parámetros para el email de invitación a organización
 */
export interface InvitationEmailParams {
  to: string;
  organizationName: string;
  role: string;
  invitationUrl: string;
  /** Token en texto para copiar manualmente si falla el enlace */
  tokenManual: string;
  invitedBy: string;
  expiresIn: string;
}

/**
 * Plantilla para email de invitación a organización.
 * Incluye enlace con token y token visible para fallback manual.
 */
export const getInvitationEmailContent = (
  params: InvitationEmailParams
): { html: string; text: string } => {
  const { organizationName, role, invitationUrl, tokenManual, invitedBy, expiresIn } = params;

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
              <h1 style="margin: 0 0 20px 0; font-size: 24px; color: #333;">Invitación a ${organizationName}</h1>
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #555; line-height: 1.5;">
                Has sido invitado por ${invitedBy} a unirte como <strong>${role}</strong>.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #555; line-height: 1.5;">
                Haz clic en el siguiente enlace para registrarte y unirte a la organización:
              </p>
              <p style="margin: 0 0 24px 0;">
                <a href="${invitationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Aceptar invitación
                </a>
              </p>
              <p style="margin: 0 0 12px 0; font-size: 14px; color: #777;">
                Si el enlace no funciona, copia este código en la pantalla de registro:
              </p>
              <p style="margin: 0 0 24px 0; padding: 12px; background-color: #f0f0f0; border-radius: 4px; font-family: monospace; word-break: break-all; font-size: 14px;">
                ${tokenManual}
              </p>
              <p style="margin: 0; font-size: 12px; color: #999;">
                Esta invitación expira en ${expiresIn}.
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
Invitación a ${organizationName}

Has sido invitado por ${invitedBy} a unirte como ${role}.

Para registrarte y unirte, visita:

${invitationUrl}

Si el enlace no funciona, usa este código en la pantalla de registro:

${tokenManual}

Esta invitación expira en ${expiresIn}.
`.trim();

  return { html, text };
};
