/**
 * Exportación centralizada de middlewares
 */

export { errorHandler } from './error-handler.js';
export {
  apiLimiter,
  authLimiter,
  forgotPasswordLimiter,
  resendVerificationLimiter,
  paymentCreateLimiter,
  webhookLimiter,
  subscriptionCreateLimiter,
  subscriptionChangePlanLimiter,
} from './rate-limiter.js';
export { authenticate, optionalAuthenticate } from './auth.middleware.js';
export { requireOnboardingComplete } from './onboarding.middleware.js';
export {
  requireOrganizationAccess,
  requireOrganizationAccessOnly,
  requireDependenciaAccess,
} from './organization-access.middleware.js';
export { requireRole, requireAdmin } from './role-authorization.middleware.js';
export { requireSuperAdmin } from './super-admin.middleware.js';
export {
  requireActiveSubscription,
  requireUsersLimit,
  requireEventosLimit,
  requireActividadesLimit,
  attachSubscriptionLimits,
  SUBSCRIPTION_LIMITS_LOCALS_KEY,
} from './subscription-limits.middleware.js';
