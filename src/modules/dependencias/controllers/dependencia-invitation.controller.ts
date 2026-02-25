import type { Request, Response } from 'express';
import * as dependenciaInvitationService from '../services/dependencia-invitation.service.js';
import { sendCreated, sendPaginated, sendNoContent } from '@/shared/responses/helpers.js';
import type {
  CreateDependenciaInvitationDTO,
  ListDependenciaInvitationsDTO,
} from '../validators/dependencia-invitation.validator.js';

export const createDependenciaInvitation = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const dependenciaId = req.dependenciaId!;
  const userId = req.user!.userId;
  const data = req.body as CreateDependenciaInvitationDTO;
  const result = await dependenciaInvitationService.createDependenciaInvitation(
    dependenciaId,
    data,
    userId
  );
  return sendCreated(res, result, 'Invitación creada y enviada por correo');
};

export const listDependenciaInvitations = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const dependenciaId = req.dependenciaId!;
  const userId = req.user!.userId;
  const filters = ((req as Request & { validatedQuery?: ListDependenciaInvitationsDTO })
    .validatedQuery ?? req.query) as ListDependenciaInvitationsDTO;
  const result = await dependenciaInvitationService.listDependenciaInvitations(
    dependenciaId,
    filters,
    userId
  );
  return sendPaginated(res, result.data, result.pagination, 'Invitaciones obtenidas');
};

export const revokeDependenciaInvitation = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const dependenciaId = req.dependenciaId!;
  const rawId = req.params['invitationId'];
  const invitationId = typeof rawId === 'string' ? rawId : (rawId?.[0] ?? '');
  const userId = req.user!.userId;
  await dependenciaInvitationService.revokeDependenciaInvitation(
    dependenciaId,
    invitationId,
    userId
  );
  return sendNoContent(res);
};
