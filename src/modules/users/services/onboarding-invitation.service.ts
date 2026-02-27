import { randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import { DateTime } from 'luxon';
import type { UUID } from '@/shared/database/types.js';
import { OnboardingInvitation } from '@/modules/users/models/onboarding-invitation.model.js';
import { sendInvitationEmail } from '@/shared/email/email.service.js';
import { NotFoundError, ForbiddenError } from '@/shared/errors/index.js';
import { logger } from '@/shared/logger/index.js';

const BCRYPT_ROUNDS = 10;
const ONBOARDING_INVITATION_EXPIRES_DAYS = 7;

export interface CreateOnboardingInvitationResult {
  id: UUID;
  email: string;
  status: string;
  expiresAt: Date;
}

export interface ValidateOnboardingInvitationResult {
  valid: true;
  email: string;
  expiresAt: Date;
  type: 'onboarding';
}

export interface ConsumeOnboardingInvitationResult {
  type: 'onboarding';
}

/**
 * Crea o regenera una invitación de onboarding para el email indicado.
 * No crea dependencia ni área; solo envía el enlace de registro.
 */
export const createOnboardingInvitation = async (
  email: string,
  invitedByUserId: UUID,
  invitedByEmail: string
): Promise<CreateOnboardingInvitationResult> => {
  const normalizedEmail = email.trim().toLowerCase();

  const token = randomBytes(32).toString('hex');
  const tokenHash = await bcrypt.hash(token, BCRYPT_ROUNDS);
  const expiresAt = DateTime.now().plus({ days: ONBOARDING_INVITATION_EXPIRES_DAYS }).toJSDate();

  let invitation = await OnboardingInvitation.findOne({
    where: { email: normalizedEmail, status: 'pending' },
  });

  if (invitation) {
    invitation.tokenHash = tokenHash;
    invitation.expiresAt = expiresAt;
    invitation.usedAt = null;
    invitation.revokedAt = null;
    await invitation.save();
  } else {
    invitation = await OnboardingInvitation.create({
      email: normalizedEmail,
      tokenHash,
      invitedBy: invitedByUserId,
      expiresAt,
    });
  }

  await sendInvitationEmail({
    to: normalizedEmail,
    organizationName: 'CONANP',
    role: 'admin',
    invitationId: invitation.id,
    token,
    invitedBy: invitedByEmail,
  });

  return {
    id: invitation.id,
    email: invitation.email,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
  };
};

/**
 * Valida un token de invitación de onboarding para pre-registro en frontend.
 * No modifica la invitación.
 */
export const validateOnboardingInvitationToken = async (
  invitationId: UUID,
  token: string
): Promise<ValidateOnboardingInvitationResult> => {
  const invitation = await OnboardingInvitation.findByPk(invitationId);

  if (!invitation) {
    throw new NotFoundError('Invitación de onboarding', { invitationId });
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

  return {
    valid: true,
    email: invitation.email,
    expiresAt: invitation.expiresAt,
    type: 'onboarding',
  };
};

/**
 * Consume invitación de onboarding en flujo de registro.
 * Marca la invitación como aceptada y valida email/token.
 */
export const consumeOnboardingInvitationForRegistration = async (
  invitationId: UUID,
  token: string,
  email: string
): Promise<ConsumeOnboardingInvitationResult> => {
  const invitation = await OnboardingInvitation.findByPk(invitationId);

  if (!invitation) {
    throw new NotFoundError('Invitación de onboarding', { invitationId });
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
    { invitationId, email: emailNormalized },
    'Invitación de onboarding consumida para registro'
  );

  return { type: 'onboarding' };
};
