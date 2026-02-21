import type { Request, Response } from 'express';
import * as invitationService from '../services/invitation.service.js';
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendNoContent,
} from '@/shared/responses/helpers.js';
import type {
  CreateInvitationDTO,
  ListInvitationsDTO,
} from '../validators/invitation.validator.js';

const getOrganizationId = (req: Request): string => {
  const id = req.params['organizationId'];
  return typeof id === 'string' ? id : (id?.[0] ?? '');
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
 * Público: valida token para mostrar formulario de registro en frontend.
 */
export const validateInvitationToken = async (req: Request, res: Response): Promise<Response> => {
  const { invitationId, token } = req.body as { invitationId: string; token: string };
  const result = await invitationService.validateInvitationToken(invitationId, token);
  return sendSuccess(res, result, 'Invitación válida');
};
