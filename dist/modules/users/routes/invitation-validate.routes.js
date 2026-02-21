import { Router } from 'express';
import { validateInvitationToken } from '../controllers/invitation.controller.js';
import { validateInvitationToken as validateInvitationTokenMiddleware } from '../middleware/validation.middleware.js';
/**
 * Router público para validar token de invitación (pre-registro).
 * Prefijo: /api/v1/invitations
 */
const invitationValidateRouter = Router();
invitationValidateRouter.post('/validate', validateInvitationTokenMiddleware, validateInvitationToken);
export default invitationValidateRouter;
//# sourceMappingURL=invitation-validate.routes.js.map