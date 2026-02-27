import { CreateOnboardingInvitationSchema } from '../validators/onboarding-invitation.validator.js';
export const validateCreateOnboardingInvitation = (req, _res, next) => {
    req.body = CreateOnboardingInvitationSchema.parse(req.body);
    next();
};
//# sourceMappingURL=onboarding-invitation-validation.middleware.js.map