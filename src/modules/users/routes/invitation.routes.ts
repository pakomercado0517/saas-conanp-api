import { Router, type Router as ExpressRouter } from 'express';
import {
  createInvitation,
  listInvitations,
  revokeInvitation,
} from '../controllers/invitation.controller.js';
import {
  validateCreateInvitation,
  validateListInvitations,
} from '../middleware/validation.middleware.js';
import {
  authenticate,
  requireOrganizationAccess,
  requireAdmin,
} from '@/shared/middleware/index.js';

/**
 * Router de invitaciones bajo organización.
 * Prefijo: /api/v1/organizations/:organizationId/invitations
 */
const invitationRouter: ExpressRouter = Router({ mergeParams: true });

invitationRouter.use(authenticate, requireOrganizationAccess, requireAdmin);

invitationRouter.post('/', validateCreateInvitation, createInvitation);
invitationRouter.get('/', validateListInvitations, listInvitations);
invitationRouter.post('/:invitationId/revoke', revokeInvitation);

export default invitationRouter;
