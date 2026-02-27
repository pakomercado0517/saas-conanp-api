import { Router, type Router as ExpressRouter } from 'express';
import { createOnboardingInvitationAdmin } from '../controllers/organization-admin-onboarding.controller.js';
import { authenticate, requireSuperAdmin } from '@/shared/middleware/index.js';
import { validateCreateOnboardingInvitation } from '@/modules/users/middleware/onboarding-invitation-validation.middleware.js';

/**
 * Router de administración: invitaciones de onboarding sin dependencia.
 * Prefijo: /api/v1/admin/onboarding-invitations
 */
const adminOnboardingRouter: ExpressRouter = Router();

adminOnboardingRouter.use(authenticate, requireSuperAdmin);

adminOnboardingRouter.post(
  '/',
  validateCreateOnboardingInvitation,
  createOnboardingInvitationAdmin
);

export default adminOnboardingRouter;
