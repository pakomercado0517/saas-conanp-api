import { Op } from 'sequelize';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import type { UUID } from '@/shared/database/types.js';
import { DependenciaInvitation } from '@/modules/dependencias/models/dependencia-invitation.model.js';
import { DependenciaMembership } from '@/modules/dependencias/models/dependencia-membership.model.js';
import { Dependencia } from '@/modules/dependencias/models/dependencia.model.js';
import { User } from '@/modules/users/models/user.model.js';
import { assertCanAccessDependencia } from '@/modules/organizations/services/organization.service.js';
import type {
  CreateDependenciaInvitationDTO,
  ListDependenciaInvitationsDTO,
} from '../validators/dependencia-invitation.validator.js';
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
  BadRequestError,
} from '@/shared/errors/index.js';
import type { PaginationMeta } from '@/shared/responses/types.js';
import { logger } from '@/shared/logger/index.js';
import { sendInvitationEmail } from '@/shared/email/email.service.js';
import { DateTime } from 'luxon';

const BCRYPT_ROUNDS = 10;
const INVITATION_EXPIRES_DAYS = 7;

const generateToken = async (): Promise<{ token: string; tokenHash: string }> => {
  const token = randomBytes(32).toString('hex');
  const tokenHash = await bcrypt.hash(token, BCRYPT_ROUNDS);
  return { token, tokenHash };
};

export interface CreateDependenciaInvitationResult {
  id: UUID;
  email: string;
  role: CreateDependenciaInvitationDTO['role'];
  expiresAt: Date;
  status: 'pending';
}

export const createDependenciaInvitation = async (
  dependenciaId: UUID,
  data: CreateDependenciaInvitationDTO,
  invitedByUserId: UUID
): Promise<CreateDependenciaInvitationResult> => {
  await assertCanAccessDependencia(invitedByUserId, dependenciaId);

  const dependencia = await Dependencia.findByPk(dependenciaId);
  if (!dependencia) {
    throw new NotFoundError('Dependencia', { dependenciaId });
  }

  const emailNormalized = data.email.trim().toLowerCase();

  const existing = await DependenciaInvitation.findOne({
    where: {
      dependenciaId,
      email: emailNormalized,
      status: 'pending',
      revokedAt: { [Op.eq]: null },
      expiresAt: { [Op.gt]: new Date() },
    },
  });
  if (existing) {
    throw new ConflictError(
      'Ya existe una invitación pendiente para este email en la dependencia',
      {
        email: emailNormalized,
        dependenciaId,
      }
    );
  }

  const existingUser = await User.findOne({ where: { email: emailNormalized } });
  if (existingUser) {
    const existingDepMembership = await DependenciaMembership.findOne({
      where: { dependenciaId, userId: existingUser.id, status: 'activo' },
    });
    if (existingDepMembership) {
      throw new ConflictError('El usuario ya es miembro de esta dependencia', {
        email: emailNormalized,
        dependenciaId,
      });
    }
  }

  const { token, tokenHash } = await generateToken();
  const expiresAt = DateTime.now().plus({ days: INVITATION_EXPIRES_DAYS }).toJSDate();

  const invitation = await DependenciaInvitation.create({
    dependenciaId,
    email: emailNormalized,
    role: data.role,
    tokenHash,
    invitedBy: invitedByUserId,
    status: 'pending',
    expiresAt,
  });

  const invitedByUser = await User.findByPk(invitedByUserId);
  const invitedByName = invitedByUser?.name ?? invitedByUser?.email ?? 'Un administrador';

  try {
    await sendInvitationEmail({
      to: emailNormalized,
      organizationName: dependencia.name,
      role: data.role,
      invitationId: invitation.id,
      token,
      invitedBy: invitedByName,
    });
  } catch (err) {
    logger.error(
      { err, invitationId: invitation.id, to: emailNormalized },
      'Error enviando email de invitación a dependencia'
    );
    throw new BadRequestError(
      'La invitación se creó pero no se pudo enviar el correo. Puedes compartir el enlace manualmente.'
    );
  }

  logger.info(
    { invitationId: invitation.id, dependenciaId, email: emailNormalized, role: data.role },
    'Invitación a dependencia creada y email enviado'
  );

  return {
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    expiresAt: invitation.expiresAt,
    status: 'pending',
  };
};

export const listDependenciaInvitations = async (
  dependenciaId: UUID,
  filters: ListDependenciaInvitationsDTO,
  userId: UUID
): Promise<{ data: DependenciaInvitation[]; pagination: PaginationMeta }> => {
  await assertCanAccessDependencia(userId, dependenciaId);

  const where: Record<string, unknown> = { dependenciaId };
  if (filters.status) where['status'] = filters.status;

  const limit = filters.limit;
  const offset = (filters.page - 1) * limit;
  const order: [string, string][] = [[filters.sortBy, filters.sortOrder]];

  const { rows, count } = await DependenciaInvitation.findAndCountAll({
    where,
    limit,
    offset,
    order,
    include: [
      { association: 'Dependencia', attributes: ['id', 'name'] },
      { association: 'InvitedByUser', attributes: ['id', 'name', 'email'] },
    ],
  });

  const total = count as number;
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

export const revokeDependenciaInvitation = async (
  dependenciaId: UUID,
  invitationId: UUID,
  userId: UUID
): Promise<void> => {
  await assertCanAccessDependencia(userId, dependenciaId);

  const invitation = await DependenciaInvitation.findOne({
    where: { id: invitationId, dependenciaId },
  });

  if (!invitation) {
    throw new NotFoundError('Invitación a dependencia', { invitationId, dependenciaId });
  }

  if (invitation.status !== 'pending') {
    throw new ForbiddenError('Solo se pueden revocar invitaciones pendientes', {
      invitationId,
      status: invitation.status,
    });
  }

  const now = new Date();
  await invitation.update({ status: 'revoked', revokedAt: now });

  logger.info({ invitationId, dependenciaId, userId }, 'Invitación a dependencia revocada');
};

export interface ValidateDependenciaInvitationResult {
  valid: true;
  email: string;
  organizationId: UUID;
  organizationName: string;
  role: string;
  expiresAt: Date;
  type: 'dependencia';
}

export const validateDependenciaInvitationToken = async (
  invitationId: UUID,
  token: string
): Promise<ValidateDependenciaInvitationResult> => {
  const invitation = await DependenciaInvitation.findByPk(invitationId, {
    include: [{ association: 'Dependencia', attributes: ['id', 'name'] }],
  });

  if (!invitation) {
    throw new NotFoundError('Invitación', { invitationId });
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
    await invitation.update({ status: 'expired' }).catch(() => {});
    throw new ForbiddenError('Esta invitación ha expirado', { invitationId });
  }

  const tokenMatches = await bcrypt.compare(token, invitation.tokenHash);
  if (!tokenMatches) {
    throw new ForbiddenError('Token de invitación inválido', { invitationId });
  }

  const dependencia = invitation.Dependencia;
  if (!dependencia) {
    throw new NotFoundError('Dependencia', { dependenciaId: invitation.dependenciaId });
  }

  return {
    valid: true,
    email: invitation.email,
    organizationId: invitation.dependenciaId,
    organizationName: dependencia.name,
    role: invitation.role,
    expiresAt: invitation.expiresAt,
    type: 'dependencia',
  };
};

export interface ConsumeDependenciaInvitationResult {
  dependenciaId: UUID;
  role: string;
}

export const consumeDependenciaInvitationForRegistration = async (
  invitationId: UUID,
  token: string,
  email: string
): Promise<ConsumeDependenciaInvitationResult> => {
  const invitation = await DependenciaInvitation.findByPk(invitationId);

  if (!invitation) {
    throw new NotFoundError('Invitación a dependencia', { invitationId });
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
    await invitation.update({ status: 'expired' }).catch(() => {});
    throw new ForbiddenError('Esta invitación ha expirado', { invitationId });
  }

  const tokenMatches = await bcrypt.compare(token, invitation.tokenHash);
  if (!tokenMatches) {
    throw new ForbiddenError('Token de invitación inválido', { invitationId });
  }

  const now = new Date();
  await invitation.update({ status: 'accepted', usedAt: now });

  logger.info(
    { invitationId, dependenciaId: invitation.dependenciaId, email: emailNormalized },
    'Invitación a dependencia consumida para registro'
  );

  return {
    dependenciaId: invitation.dependenciaId,
    role: invitation.role,
  };
};
