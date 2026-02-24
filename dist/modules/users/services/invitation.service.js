import { Op } from 'sequelize';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import { Invitation } from '../../../modules/users/models/invitation.model.js';
import { InvitationEmailProof } from '../../../modules/users/models/invitation-email-proof.model.js';
import { User } from '../../../modules/users/models/user.model.js';
import { Area } from '../../../modules/areas/models/area.model.js';
import { NotFoundError, ConflictError, ForbiddenError, BadRequestError, } from '../../../shared/errors/index.js';
import { logger } from '../../../shared/logger/index.js';
import { checkUsersLimit } from '../../../modules/subscriptions/services/subscription-limits.service.js';
import { sendInvitationEmail } from '../../../shared/email/email.service.js';
import { assertIsAdmin } from './membership.service.js';
import { DateTime } from 'luxon';
const BCRYPT_ROUNDS = 10;
const INVITATION_EXPIRES_DAYS = 7;
const generateInvitationToken = async () => {
    const token = randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(token, BCRYPT_ROUNDS);
    return { token, tokenHash };
};
/**
 * Crea una invitación y envía el email con enlace y token manual.
 * Solo admins. Valida límite de usuarios y evita duplicados (pending) por org+email.
 */
export const createInvitation = async (areaId, data, invitedByUserId) => {
    await assertIsAdmin(invitedByUserId, areaId);
    const area = await Area.findByPk(areaId);
    if (!area) {
        throw new NotFoundError('?rea', { areaId });
    }
    const emailNormalized = data.email.trim().toLowerCase();
    const existingPending = await Invitation.findOne({
        where: {
            areaId,
            email: emailNormalized,
            status: 'pending',
            revokedAt: { [Op.eq]: null },
            expiresAt: { [Op.gt]: new Date() },
        },
    });
    if (existingPending) {
        throw new ConflictError('Ya existe una invitaci?n pendiente para este email en el ?rea', {
            email: emailNormalized,
            areaId,
        });
    }
    await checkUsersLimit(areaId);
    const { token, tokenHash } = await generateInvitationToken();
    const expiresAt = DateTime.now().plus({ days: INVITATION_EXPIRES_DAYS }).toJSDate();
    const invitation = await Invitation.create({
        areaId,
        email: emailNormalized,
        role: data.role,
        tokenHash,
        invitedBy: invitedByUserId,
        status: 'pending',
        expiresAt,
    });
    const invitedByUser = await User.findByPk(invitation.invitedBy);
    const invitedByName = invitedByUser?.name ?? invitedByUser?.email ?? 'Un administrador';
    try {
        await sendInvitationEmail({
            to: emailNormalized,
            organizationName: area.name,
            role: data.role,
            invitationId: invitation.id,
            token,
            invitedBy: invitedByName,
        });
    }
    catch (err) {
        logger.error({ err, invitationId: invitation.id, to: emailNormalized }, 'Error enviando email de invitación');
        throw new BadRequestError('La invitación se creó pero no se pudo enviar el correo. El administrador puede compartir el enlace o el código manualmente.');
    }
    logger.info({ invitationId: invitation.id, areaId, email: emailNormalized, role: data.role }, 'Invitaci?n creada y email enviado');
    return {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        status: 'pending',
    };
};
/**
 * Lista invitaciones de una organización con paginación y filtro por estado.
 */
export const listInvitations = async (areaId, filters, userId) => {
    await assertIsAdmin(userId, areaId);
    const where = { areaId };
    if (filters.status) {
        where['status'] = filters.status;
    }
    const limit = filters.limit;
    const offset = (filters.page - 1) * limit;
    const order = [[filters.sortBy, filters.sortOrder]];
    const { rows, count } = await Invitation.findAndCountAll({
        where,
        limit,
        offset,
        order,
        include: [
            { association: 'Area', attributes: ['id', 'name'] },
            { association: 'InvitedByUser', attributes: ['id', 'name', 'email'] },
        ],
    });
    const total = count;
    const totalPages = Math.ceil(total / limit);
    return {
        data: rows,
        pagination: {
            page: filters.page,
            limit,
            total,
            totalPages,
        },
    };
};
/**
 * Revoca una invitación (solo admins). Establece status revoked y revokedAt.
 */
export const revokeInvitation = async (areaId, invitationId, userId) => {
    await assertIsAdmin(userId, areaId);
    const invitation = await Invitation.findOne({
        where: { id: invitationId, areaId },
    });
    if (!invitation) {
        throw new NotFoundError('Invitaci?n', { invitationId, areaId });
    }
    if (invitation.status !== 'pending') {
        throw new ForbiddenError('Solo se pueden revocar invitaciones pendientes', {
            invitationId,
            status: invitation.status,
        });
    }
    const now = new Date();
    await invitation.update({
        status: 'revoked',
        revokedAt: now,
    });
    logger.info({ invitationId, areaId, userId }, 'Invitaci?n revocada');
};
/**
 * Valida un token de invitación (para pre-registro en frontend).
 * No consume la invitación; solo comprueba que sea válida.
 */
export const validateInvitationToken = async (invitationId, token) => {
    const invitation = await Invitation.findByPk(invitationId, {
        include: [{ association: 'Area', attributes: ['id', 'name'] }],
    });
    if (!invitation) {
        throw new NotFoundError('Invitaci?n', { invitationId });
    }
    if (invitation.status !== 'pending') {
        throw new ForbiddenError('Esta invitaci?n ya no est? disponible', {
            invitationId,
            status: invitation.status,
        });
    }
    if (invitation.revokedAt) {
        throw new ForbiddenError('Esta invitaci?n ha sido revocada', { invitationId });
    }
    if (new Date() > invitation.expiresAt) {
        await invitation.update({ status: 'expired' }).catch(() => { });
        throw new ForbiddenError('Esta invitaci?n ha expirado', { invitationId });
    }
    const tokenMatches = await bcrypt.compare(token, invitation.tokenHash);
    if (!tokenMatches) {
        throw new ForbiddenError('Token de invitaci?n inv?lido', { invitationId });
    }
    const area = invitation.Area;
    if (!area) {
        throw new NotFoundError('?rea', { areaId: invitation.areaId });
    }
    return {
        valid: true,
        email: invitation.email,
        organizationId: invitation.areaId,
        organizationName: area.name,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
    };
};
/**
 * Consume una invitación al completar el registro: valida token y email, marca invitación como usada.
 * Debe llamarse antes de crear el usuario. Revalida límite de usuarios del plan.
 */
export const consumeInvitationForRegistration = async (invitationId, token, email) => {
    const invitation = await Invitation.findByPk(invitationId);
    if (!invitation) {
        throw new NotFoundError('Invitación', { invitationId });
    }
    const emailNormalized = email.trim().toLowerCase();
    if (invitation.email !== emailNormalized) {
        throw new ForbiddenError('El email del registro debe coincidir con el de la invitación', {
            invitationId,
        });
    }
    if (invitation.status !== 'pending') {
        throw new ForbiddenError('Esta invitación ya no está disponible', {
            invitationId,
            status: invitation.status,
        });
    }
    if (invitation.revokedAt) {
        throw new ForbiddenError('Esta invitación ha sido revocada', { invitationId });
    }
    if (new Date() > invitation.expiresAt) {
        await invitation.update({ status: 'expired' }).catch(() => { });
        throw new ForbiddenError('Esta invitación ha expirado', { invitationId });
    }
    const tokenMatches = await bcrypt.compare(token, invitation.tokenHash);
    if (!tokenMatches) {
        throw new ForbiddenError('Token de invitación inválido', { invitationId });
    }
    await checkUsersLimit(invitation.areaId);
    const now = new Date();
    await invitation.update({
        status: 'accepted',
        usedAt: now,
    });
    logger.info({ invitationId, areaId: invitation.areaId, email: emailNormalized }, 'Invitaci?n consumida para registro');
    return {
        organizationId: invitation.areaId,
        role: invitation.role,
    };
};
/**
 * Consume una invitaci?n tras haber validado la prueba de email (flujo invitation_code).
 * Requiere que exista un InvitationEmailProof ya usado (usedAt no null) para esta invitaci?n y email.
 */
export const consumeInvitationAfterProof = async (invitationId, email) => {
    const invitation = await Invitation.findByPk(invitationId);
    if (!invitation) {
        throw new NotFoundError('Invitaci?n', { invitationId });
    }
    const emailNormalized = email.trim().toLowerCase();
    if (invitation.email !== emailNormalized) {
        throw new ForbiddenError('El email del registro debe coincidir con el de la invitaci?n', {
            invitationId,
        });
    }
    if (invitation.status !== 'pending') {
        throw new ForbiddenError('Esta invitaci?n ya no est? disponible', {
            invitationId,
            status: invitation.status,
        });
    }
    if (invitation.revokedAt) {
        throw new ForbiddenError('Esta invitaci?n ha sido revocada', { invitationId });
    }
    if (new Date() > invitation.expiresAt) {
        throw new ForbiddenError('Esta invitaci?n ha expirado', { invitationId });
    }
    const proofUsed = await InvitationEmailProof.findOne({
        where: {
            invitationId,
            email: emailNormalized,
            usedAt: { [Op.ne]: null },
        },
        order: [['createdAt', 'DESC']],
    });
    if (!proofUsed) {
        throw new ForbiddenError('Debes verificar tu email con el c?digo enviado antes de completar el registro', { invitationId });
    }
    await checkUsersLimit(invitation.areaId);
    const now = new Date();
    await invitation.update({
        status: 'accepted',
        usedAt: now,
    });
    logger.info({ invitationId, organizationId: invitation.areaId, email: emailNormalized }, 'Invitaci?n consumida para registro (tras proof de email)');
    return {
        organizationId: invitation.areaId,
        role: invitation.role,
    };
};
//# sourceMappingURL=invitation.service.js.map