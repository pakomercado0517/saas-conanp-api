import * as dependenciaInvitationService from '../services/dependencia-invitation.service.js';
import { sendCreated, sendPaginated, sendNoContent } from '../../../shared/responses/helpers.js';
export const createDependenciaInvitation = async (req, res) => {
    const dependenciaId = req.dependenciaId;
    const userId = req.user.userId;
    const data = req.body;
    const result = await dependenciaInvitationService.createDependenciaInvitation(dependenciaId, data, userId);
    return sendCreated(res, result, 'Invitación creada y enviada por correo');
};
export const listDependenciaInvitations = async (req, res) => {
    const dependenciaId = req.dependenciaId;
    const userId = req.user.userId;
    const filters = (req
        .validatedQuery ?? req.query);
    const result = await dependenciaInvitationService.listDependenciaInvitations(dependenciaId, filters, userId);
    return sendPaginated(res, result.data, result.pagination, 'Invitaciones obtenidas');
};
export const revokeDependenciaInvitation = async (req, res) => {
    const dependenciaId = req.dependenciaId;
    const rawId = req.params['invitationId'];
    const invitationId = typeof rawId === 'string' ? rawId : (rawId?.[0] ?? '');
    const userId = req.user.userId;
    await dependenciaInvitationService.revokeDependenciaInvitation(dependenciaId, invitationId, userId);
    return sendNoContent(res);
};
//# sourceMappingURL=dependencia-invitation.controller.js.map