import type { Request, Response } from 'express';
import * as invitationService from '../services/invitation.service.js';
import * as invitationEmailProofService from '../services/invitation-email-proof.service.js';
import { validateDependenciaInvitationToken } from '@/modules/dependencias/services/dependencia-invitation.service.js';
import { validateOnboardingInvitationToken } from '@/modules/users/services/onboarding-invitation.service.js';
import { NotFoundError } from '@/shared/errors/index.js';
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendNoContent,
} from '@/shared/responses/helpers.js';
import type {
  CreateInvitationDTO,
  ListInvitationsDTO,
  StartVerifyEmailDTO,
  ConfirmVerifyEmailDTO,
} from '../validators/invitation.validator.js';

const getOrganizationId = (req: Request): string => {
  const id =
    req.areaId ?? req.organizationId ?? req.params['areaId'] ?? req.params['organizationId'];
  const str =
    typeof id === 'string' ? id : Array.isArray(id) ? id[0] : id != null ? String(id) : '';
  return str ?? '';
};

const getInvitationId = (req: Request): string => {
  const id = req.params['invitationId'];
  return typeof id === 'string' ? id : (id?.[0] ?? '');
};

/**
 * POST /api/v1/organizations/:organizationId/invitations
 */
export const createInvitation = async (req: Request, res: Response): Promise<Response> => {
  const organizationId = getOrganizationId(req);
  const userId = req.user!.userId;
  const data = req.body as CreateInvitationDTO;
  const result = await invitationService.createInvitation(organizationId, data, userId);
  return sendCreated(res, result, 'Invitación creada y enviada por correo');
};

/**
 * GET /api/v1/organizations/:organizationId/invitations
 */
export const listInvitations = async (req: Request, res: Response): Promise<Response> => {
  const organizationId = getOrganizationId(req);
  const userId = req.user!.userId;
  const filters = req.validatedQuery as ListInvitationsDTO;
  const result = await invitationService.listInvitations(organizationId, filters, userId);
  return sendPaginated(res, result.data, result.pagination, 'Invitaciones obtenidas');
};

/**
 * POST /api/v1/organizations/:organizationId/invitations/:invitationId/revoke
 */
export const revokeInvitation = async (req: Request, res: Response): Promise<Response> => {
  const organizationId = getOrganizationId(req);
  const invitationId = getInvitationId(req);
  const userId = req.user!.userId;
  await invitationService.revokeInvitation(organizationId, invitationId, userId);
  return sendNoContent(res);
};

/**
 * POST /api/v1/invitations/validate
 * Público: valida token (área o dependencia) para mostrar formulario de registro en frontend.
 * Intenta primero invitación a área; si no existe, intenta invitación a dependencia.
 */
export const validateInvitationToken = async (req: Request, res: Response): Promise<Response> => {
  const { invitationId, token } = req.body as { invitationId: string; token: string };
  try {
    const result = await invitationService.validateInvitationToken(invitationId, token);
    return sendSuccess(res, { ...result, type: 'area' }, 'Invitación válida');
  } catch (err) {
    if (err instanceof NotFoundError) {
      try {
        const depResult = await validateDependenciaInvitationToken(invitationId, token);
        return sendSuccess(res, depResult, 'Invitación válida');
      } catch (errDep) {
        if (errDep instanceof NotFoundError) {
          const onboardingResult = await validateOnboardingInvitationToken(invitationId, token);
          return sendSuccess(res, onboardingResult, 'Invitación válida');
        }
        throw errDep;
      }
    }
    throw err;
  }
};

/**
 * POST /api/v1/invitations/verify-email/start
 * Público: inicia verificación de email para flujo código manual; envía OTP por correo.
 */
export const startVerifyEmail = async (req: Request, res: Response): Promise<Response> => {
  const data = req.body as StartVerifyEmailDTO;
  const result = await invitationEmailProofService.startVerifyEmail(data.invitationId, data.email);
  return sendSuccess(res, result, result.message);
};

/**
 * POST /api/v1/invitations/verify-email/confirm
 * Público: confirma OTP y devuelve invitationProof para usar en registro.
 */
export const confirmVerifyEmail = async (req: Request, res: Response): Promise<Response> => {
  const data = req.body as ConfirmVerifyEmailDTO;
  const result = await invitationEmailProofService.confirmVerifyEmail(
    data.invitationId,
    data.email,
    data.otp
  );
  return sendSuccess(
    res,
    result,
    'Comprobante generado. Completa el registro con invitationProof.'
  );
};
