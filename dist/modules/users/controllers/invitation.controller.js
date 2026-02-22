import * as invitationService from '../services/invitation.service.js';
import * as invitationEmailProofService from '../services/invitation-email-proof.service.js';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent, } from '../../../shared/responses/helpers.js';
const getOrganizationId = (req) => {
    const id = req.params['organizationId'];
    return typeof id === 'string' ? id : (id?.[0] ?? '');
};
const getInvitationId = (req) => {
    const id = req.params['invitationId'];
    return typeof id === 'string' ? id : (id?.[0] ?? '');
};
/**
 * POST /api/v1/organizations/:organizationId/invitations
 */
export const createInvitation = async (req, res) => {
    const organizationId = getOrganizationId(req);
    const userId = req.user.userId;
    const data = req.body;
    const result = await invitationService.createInvitation(organizationId, data, userId);
    return sendCreated(res, result, 'Invitación creada y enviada por correo');
};
/**
 * GET /api/v1/organizations/:organizationId/invitations
 */
export const listInvitations = async (req, res) => {
    const organizationId = getOrganizationId(req);
    const userId = req.user.userId;
    const filters = req.validatedQuery;
    const result = await invitationService.listInvitations(organizationId, filters, userId);
    return sendPaginated(res, result.data, result.pagination, 'Invitaciones obtenidas');
};
/**
 * POST /api/v1/organizations/:organizationId/invitations/:invitationId/revoke
 */
export const revokeInvitation = async (req, res) => {
    const organizationId = getOrganizationId(req);
    const invitationId = getInvitationId(req);
    const userId = req.user.userId;
    await invitationService.revokeInvitation(organizationId, invitationId, userId);
    return sendNoContent(res);
};
/**
 * POST /api/v1/invitations/validate
 * Público: valida token para mostrar formulario de registro en frontend.
 */
export const validateInvitationToken = async (req, res) => {
    const { invitationId, token } = req.body;
    const result = await invitationService.validateInvitationToken(invitationId, token);
    return sendSuccess(res, result, 'Invitación válida');
};
/**
 * POST /api/v1/invitations/verify-email/start
 * Público: inicia verificación de email para flujo código manual; envía OTP por correo.
 */
export const startVerifyEmail = async (req, res) => {
    const data = req.body;
    const result = await invitationEmailProofService.startVerifyEmail(data.invitationId, data.email);
    return sendSuccess(res, result, result.message);
};
/**
 * POST /api/v1/invitations/verify-email/confirm
 * Público: confirma OTP y devuelve invitationProof para usar en registro.
 */
export const confirmVerifyEmail = async (req, res) => {
    const data = req.body;
    const result = await invitationEmailProofService.confirmVerifyEmail(data.invitationId, data.email, data.otp);
    return sendSuccess(res, result, 'Comprobante generado. Completa el registro con invitationProof.');
};
//# sourceMappingURL=invitation.controller.js.map