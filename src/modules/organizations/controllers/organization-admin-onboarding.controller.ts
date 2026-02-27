import type { Request, Response } from 'express';
import { sendCreated } from '@/shared/responses/helpers.js';
import { createOnboardingInvitation } from '@/modules/users/services/onboarding-invitation.service.js';
import type { CreateOnboardingInvitationDTO } from '@/modules/users/validators/onboarding-invitation.validator.js';

/**
 * POST /api/v1/admin/onboarding-invitations
 * Super admin: crea invitación de onboarding para primer admin (sin dependencia ni área).
 */
export const createOnboardingInvitationAdmin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const data = req.body as CreateOnboardingInvitationDTO;
  const userId = req.user?.userId;
  const email = req.user?.email;

  if (!userId || !email) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const result = await createOnboardingInvitation(data.email, userId, email);
  return sendCreated(res, result, 'Invitación de onboarding creada y enviada por correo');
};

