import { randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import { DateTime } from 'luxon';
import { Area } from '../../../modules/areas/models/area.model.js';
import { Invitation } from '../../../modules/users/models/invitation.model.js';
import { InvitationEmailProof } from '../../../modules/users/models/invitation-email-proof.model';
import { sendInvitationOtpEmail, INVITATION_OTP_EXPIRES_MINUTES, } from '../../../shared/email/email.service';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../shared/errors';
import { logger } from '../../../shared/logger';
const BCRYPT_ROUNDS = 10;
const OTP_LENGTH = 6;
const PROOF_EXPIRES_MINUTES = 5;
const MAX_ATTEMPTS = 5;
/**
 * Genera un OTP numérico de 6 dígitos y su hash.
 */
const generateOtp = async () => {
    const digits = randomBytes(OTP_LENGTH).map((b) => b % 10);
    const otp = digits.join('');
    const otpHash = await bcrypt.hash(otp, BCRYPT_ROUNDS);
    return { otp, otpHash };
};
/**
 * Genera un token de proof (single-use, corta vida) y su hash.
 */
const generateProofToken = async () => {
    const proof = randomBytes(32).toString('hex');
    const proofHash = await bcrypt.hash(proof, BCRYPT_ROUNDS);
    return { proof, proofHash };
};
/**
 * Valida que la invitación exista, esté pendiente, no revocada, no expirada y que el email coincida.
 * No consume la invitación.
 */
const assertInvitationValidForEmailProof = async (invitationId, email) => {
    const invitation = await Invitation.findByPk(invitationId, {
        include: [{ model: Area, as: 'Area', attributes: ['id', 'name'] }],
    });
    if (!invitation) {
        throw new NotFoundError('Invitación', { invitationId });
    }
    const emailNormalized = email.trim().toLowerCase();
    if (invitation.email !== emailNormalized) {
        throw new ForbiddenError('El email no coincide con el de la invitación', { invitationId });
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
        throw new ForbiddenError('Esta invitación ha expirado', { invitationId });
    }
    return invitation;
};
/**
 * Inicia el flujo de verificación de email para registro por código manual.
 * Valida la invitación, crea un proof con OTP y envía el OTP por correo.
 */
export const startVerifyEmail = async (invitationId, email) => {
    const invitation = await assertInvitationValidForEmailProof(invitationId, email);
    const emailNormalized = email.trim().toLowerCase();
    const existing = await InvitationEmailProof.findOne({
        where: { invitationId, email: emailNormalized },
        order: [['createdAt', 'DESC']],
    });
    if (existing &&
        !existing.usedAt &&
        existing.otpExpiresAt > new Date() &&
        !existing.proofTokenHash) {
        throw new ValidationError('Ya se envió un código recientemente. Espera unos minutos o usa el código que recibiste.', undefined, { retryAfterMinutes: Math.ceil((existing.otpExpiresAt.getTime() - Date.now()) / 60000) });
    }
    const { otp, otpHash } = await generateOtp();
    const otpExpiresAt = DateTime.now().plus({ minutes: INVITATION_OTP_EXPIRES_MINUTES }).toJSDate();
    await InvitationEmailProof.create({
        invitationId,
        email: emailNormalized,
        otpHash,
        attempts: 0,
        maxAttempts: MAX_ATTEMPTS,
        otpExpiresAt,
    });
    const organizationName = invitation.Area?.name ?? 'el área';
    await sendInvitationOtpEmail({
        to: emailNormalized,
        organizationName,
        otp,
    });
    logger.info({ invitationId, email: emailNormalized }, 'Verificación de email por invitación iniciada, OTP enviado');
    return {
        message: 'Si el email coincide con la invitación, recibirás un código de verificación.',
    };
};
/**
 * Confirma el OTP y emite un proof token para usar en el registro (invitation_code).
 */
export const confirmVerifyEmail = async (invitationId, email, otp) => {
    const emailNormalized = email.trim().toLowerCase();
    const proofRecord = await InvitationEmailProof.findOne({
        where: { invitationId, email: emailNormalized },
        order: [['createdAt', 'DESC']],
    });
    if (!proofRecord) {
        throw new ForbiddenError('Código inválido o expirado. Solicita uno nuevo.');
    }
    if (proofRecord.usedAt) {
        throw new ForbiddenError('Este código ya fue utilizado. Solicita uno nuevo.');
    }
    if (proofRecord.proofTokenHash) {
        throw new ForbiddenError('Ya se generó un comprobante para este código. Procede al registro.');
    }
    if (new Date() > proofRecord.otpExpiresAt) {
        throw new ForbiddenError('Código inválido o expirado. Solicita uno nuevo.');
    }
    if (proofRecord.attempts >= proofRecord.maxAttempts) {
        throw new ForbiddenError('Demasiados intentos. Solicita un nuevo código.');
    }
    const otpMatches = await bcrypt.compare(otp.trim(), proofRecord.otpHash);
    if (!otpMatches) {
        await proofRecord.update({
            attempts: proofRecord.attempts + 1,
        });
        throw new ForbiddenError('Código inválido o expirado. Solicita uno nuevo.');
    }
    const { proof, proofHash } = await generateProofToken();
    const proofExpiresAt = DateTime.now().plus({ minutes: PROOF_EXPIRES_MINUTES }).toJSDate();
    await proofRecord.update({
        proofTokenHash: proofHash,
        proofExpiresAt,
    });
    logger.info({ invitationId, email: emailNormalized }, 'Proof de invitación emitido tras OTP correcto');
    return {
        invitationProof: proof,
        invitationId,
        email: emailNormalized,
        expiresAt: proofExpiresAt,
    };
};
/**
 * Consume un proof token (single-use) y devuelve los datos de la invitación para completar el registro.
 * Marca el proof como usado.
 */
export const consumeProofForRegistration = async (invitationId, email, invitationProof) => {
    const emailNormalized = email.trim().toLowerCase();
    const proofRecord = await InvitationEmailProof.findOne({
        where: { invitationId, email: emailNormalized },
        include: [{ model: Invitation, as: 'Invitation', required: true }],
        order: [['createdAt', 'DESC']],
    });
    if (!proofRecord || !proofRecord.Invitation) {
        throw new ForbiddenError('Comprobante inválido o ya utilizado.');
    }
    if (!proofRecord.proofTokenHash || !proofRecord.proofExpiresAt) {
        throw new ForbiddenError('Comprobante inválido. Completa la verificación de email primero.');
    }
    if (proofRecord.usedAt) {
        throw new ForbiddenError('Comprobante inválido o ya utilizado.');
    }
    if (new Date() > proofRecord.proofExpiresAt) {
        throw new ForbiddenError('Comprobante expirado. Vuelve a verificar tu email.');
    }
    const proofMatches = await bcrypt.compare(invitationProof.trim(), proofRecord.proofTokenHash);
    if (!proofMatches) {
        throw new ForbiddenError('Comprobante inválido o ya utilizado.');
    }
    await proofRecord.update({ usedAt: new Date() });
    const invitation = proofRecord.Invitation;
    return {
        organizationId: invitation.areaId,
        role: invitation.role,
    };
};
//# sourceMappingURL=invitation-email-proof.service.js.map