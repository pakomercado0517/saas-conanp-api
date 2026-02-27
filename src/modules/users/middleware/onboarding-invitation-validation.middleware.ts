import type { Request, Response, NextFunction } from 'express';
import { CreateOnboardingInvitationSchema } from '../validators/onboarding-invitation.validator.js';

export const validateCreateOnboardingInvitation = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  req.body = CreateOnboardingInvitationSchema.parse(req.body);
  next();
};
