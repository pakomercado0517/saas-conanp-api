/**
 * Plantilla para email con código OTP (verificación de email para registro por código de invitación)
 */
export const getInvitationOtpEmailContent = (params) => {
    const { organizationName, otp, expiresInMinutes } = params;
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
              <h1 style="margin: 0 0 20px 0; font-size: 24px; color: #333;">Código de verificación</h1>
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #555; line-height: 1.5;">
                Has solicitado completar tu registro en <strong>${organizationName}</strong>. Introduce este código en la aplicación:
              </p>
              <p style="margin: 0 0 24px 0; font-size: 28px; font-weight: bold; letter-spacing: 0.2em; color: #2563eb;">
                ${otp}
              </p>
              <p style="margin: 0; font-size: 14px; color: #777; line-height: 1.5;">
                Este código expira en ${expiresInMinutes} minutos. Si no solicitaste este código, ignora este correo.
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
Código de verificación

Has solicitado completar tu registro en ${organizationName}. Introduce este código en la aplicación:

${otp}

Este código expira en ${expiresInMinutes} minutos. Si no solicitaste este código, ignora este correo.
`.trim();
    return { html, text };
};
//# sourceMappingURL=invitation-otp.template.js.map