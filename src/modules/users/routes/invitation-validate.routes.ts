import { Router, type Router as ExpressRouter } from 'express';
import { validateInvitationToken } from '../controllers/invitation.controller.js';
import { validateInvitationToken as validateInvitationTokenMiddleware } from '../middleware/validation.middleware.js';

/**
 * Router público para validar token de invitación (pre-registro).
 * Prefijo: /api/v1/invitations
 */
const invitationValidateRouter: ExpressRouter = Router();

invitationValidateRouter.post(
  '/validate',
  validateInvitationTokenMiddleware,
  validateInvitationToken
);

export default invitationValidateRouter;
