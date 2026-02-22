import { Router, type Router as ExpressRouter } from 'express';
import {
  validateInvitationToken,
  startVerifyEmail,
  confirmVerifyEmail,
} from '../controllers/invitation.controller.js';
import {
  validateInvitationToken as validateInvitationTokenMiddleware,
  validateStartVerifyEmail,
  validateConfirmVerifyEmail,
} from '../middleware/validation.middleware.js';

/**
 * Router público para validar token de invitación y verificación de email (pre-registro).
 * Prefijo: /api/v1/invitations
 */
const invitationValidateRouter: ExpressRouter = Router();

invitationValidateRouter.post(
  '/validate',
  validateInvitationTokenMiddleware,
  validateInvitationToken
);

invitationValidateRouter.post('/verify-email/start', validateStartVerifyEmail, startVerifyEmail);

invitationValidateRouter.post(
  '/verify-email/confirm',
  validateConfirmVerifyEmail,
  confirmVerifyEmail
);

export default invitationValidateRouter;
