import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { DateTime } from 'luxon';
import { randomBytes } from 'crypto';
import { User } from '@/modules/users/models/user.model.js';
import { Membership } from '@/modules/users/models/membership.model.js';
import { RefreshToken } from '@/modules/auth/models/refresh-token.model.js';
import type { RegisterDTO, LoginDTO } from '../validators/auth.validator.js';
import { ConflictError, UnauthorizedError, BadRequestError } from '@/shared/errors/index.js';
import { logger } from '@/shared/logger/index.js';
import {
  consumeInvitationForRegistration,
  type ConsumeInvitationResult,
} from '@/modules/users/services/invitation.service.js';
import type {
  AuthResponse,
  RegisterResponse,
  RefreshTokenResponse,
  JWTPayload,
} from '../types/auth.types.js';
import type { UUID } from '@/shared/database/types.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '@/shared/email/index.js';

/**
 * Configuración de JWT
 */
const JWT_SECRET = process.env['JWT_SECRET'];
const JWT_ACCESS_EXPIRES_IN: string = process.env['JWT_ACCESS_EXPIRES_IN'] || '15m'; // 15 minutos por defecto
const JWT_REFRESH_EXPIRES_IN: string = process.env['JWT_REFRESH_EXPIRES_IN'] || '7d'; // 7 días por defecto
const BCRYPT_ROUNDS = 10; // Mínimo según reglas del proyecto

/**
 * Valida que las variables de entorno requeridas estén configuradas
 */
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definida en las variables de entorno');
}

// Asegurar que JWT_SECRET sea string para TypeScript
const JWT_SECRET_STRING: string = JWT_SECRET;

/**
 * Calcula la expiración en segundos desde ahora
 */
const getExpiresInSeconds = (expiresIn: string): number => {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 15 * 60; // Default 15 minutos
  }

  const [, value, unit] = match;
  if (!value || !unit) {
    return 15 * 60; // Default 15 minutos
  }
  const num = parseInt(value, 10);

  switch (unit) {
    case 's':
      return num;
    case 'm':
      return num * 60;
    case 'h':
      return num * 60 * 60;
    case 'd':
      return num * 24 * 60 * 60;
    default:
      return 15 * 60;
  }
};

/**
 * Tipo para valores de tiempo válidos en JWT (compatible con ms package)
 */
type TimeString = `${number}${'s' | 'm' | 'h' | 'd'}` | number;

/**
 * Genera un access token JWT
 */
const generateAccessToken = (userId: UUID, email: string): string => {
  const payload: JWTPayload = {
    userId,
    email,
    type: 'access',
  };

  return jwt.sign(payload, JWT_SECRET_STRING, {
    expiresIn: JWT_ACCESS_EXPIRES_IN as TimeString,
  });
};

/**
 * Genera un refresh token aleatorio y lo hashea
 */
const generateRefreshToken = async (): Promise<{ token: string; hashedToken: string }> => {
  const token = randomBytes(32).toString('hex');
  const hashedToken = await bcrypt.hash(token, BCRYPT_ROUNDS);
  return { token, hashedToken };
};

/**
 * Calcula la fecha de expiración del refresh token
 */
const getRefreshTokenExpiration = (): Date => {
  const expiresIn = JWT_REFRESH_EXPIRES_IN;
  const match = expiresIn.match(/^(\d+)([smhd])$/);

  if (!match) {
    // Default 7 días
    return DateTime.now().plus({ days: 7 }).toJSDate();
  }

  const [, value, unit] = match;
  if (!value || !unit) {
    // Default 7 días
    return DateTime.now().plus({ days: 7 }).toJSDate();
  }
  const num = parseInt(value, 10);

  let expiration: DateTime;
  switch (unit) {
    case 's':
      expiration = DateTime.now().plus({ seconds: num });
      break;
    case 'm':
      expiration = DateTime.now().plus({ minutes: num });
      break;
    case 'h':
      expiration = DateTime.now().plus({ hours: num });
      break;
    case 'd':
      expiration = DateTime.now().plus({ days: num });
      break;
    default:
      expiration = DateTime.now().plus({ days: 7 });
  }

  return expiration.toJSDate();
};

/** Expiración del token de verificación de email: 24 horas */
const EMAIL_VERIFICATION_EXPIRES_HOURS = 24;

/** Expiración del token de recuperación de contraseña: 1 hora */
const PASSWORD_RESET_EXPIRES_HOURS = 1;

/**
 * Genera un token de verificación de email (plain) y su hash
 */
const generateVerificationToken = async (): Promise<{
  token: string;
  hashedToken: string;
}> => {
  const token = randomBytes(32).toString('hex');
  const hashedToken = await bcrypt.hash(token, BCRYPT_ROUNDS);
  return { token, hashedToken };
};

const isTestBypassRegister =
  process.env['NODE_ENV'] === 'test' && process.env['ALLOW_REGISTER_WITHOUT_INVITATION'] === 'true';

/**
 * Registra un nuevo usuario con invitación válida (o sin ella solo en test con bypass).
 * Consume la invitación, crea usuario y membership, envía email de verificación.
 */
export const register = async (data: RegisterDTO): Promise<RegisterResponse> => {
  let invitationData: ConsumeInvitationResult | null = null;

  if (data.invitationId && data.token) {
    invitationData = await consumeInvitationForRegistration(
      data.invitationId,
      data.token,
      data.email
    );
  } else if (!isTestBypassRegister) {
    throw new BadRequestError(
      'Se requiere una invitación válida (invitationId y token) para registrarse'
    );
  }

  const existingUser = await User.findOne({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError('El email ya está registrado', {
      email: data.email,
    });
  }

  const hashedPassword = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  const { token: verificationToken, hashedToken: hashedVerificationToken } =
    await generateVerificationToken();
  const verificationExpiresAt = DateTime.now()
    .plus({ hours: EMAIL_VERIFICATION_EXPIRES_HOURS })
    .toJSDate();

  const user = await User.create({
    email: data.email,
    password: hashedPassword,
    name: data.name,
    emailVerified: false,
    emailVerificationToken: hashedVerificationToken,
    emailVerificationExpiresAt: verificationExpiresAt,
  });

  if (invitationData) {
    await Membership.create({
      userId: user.id,
      organizationId: invitationData.organizationId,
      role: invitationData.role,
      status: 'activo',
    });
  }

  await sendVerificationEmail({
    to: user.email,
    name: user.name,
    token: verificationToken,
  });

  logger.info(
    {
      userId: user.id,
      email: user.email,
      ...(invitationData && { organizationId: invitationData.organizationId }),
    },
    invitationData
      ? 'Usuario registrado con invitación, email de verificación enviado'
      : 'Usuario registrado, email de verificación enviado'
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    message: 'Revisa tu correo electrónico para verificar tu cuenta',
  };
};

/**
 * Inicia sesión con email y contraseña
 */
export const login = async (data: LoginDTO): Promise<AuthResponse> => {
  // Buscar usuario por email
  const user = await User.findOne({
    where: { email: data.email },
  });

  if (!user) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  // Verificar que el correo esté verificado
  if (!user.emailVerified) {
    throw new UnauthorizedError('Debes verificar tu correo electrónico antes de iniciar sesión');
  }

  // Verificar contraseña
  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  // Generar tokens
  const accessToken = generateAccessToken(user.id, user.email);
  const { token: refreshToken, hashedToken } = await generateRefreshToken();
  const expiresAt = getRefreshTokenExpiration();

  // Guardar refresh token
  await RefreshToken.create({
    userId: user.id,
    token: hashedToken,
    expiresAt,
  });

  logger.info(
    {
      userId: user.id,
      email: user.email,
    },
    'Usuario inició sesión exitosamente'
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    accessToken,
    refreshToken,
    expiresIn: getExpiresInSeconds(JWT_ACCESS_EXPIRES_IN),
  };
};

/**
 * Valida un access token JWT
 */
export const validateToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_STRING) as JWTPayload;

    // Verificar que sea un access token
    if (decoded.type !== 'access') {
      throw new UnauthorizedError('Tipo de token inválido');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token expirado');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Token inválido');
    }
    throw error;
  }
};

/**
 * Renueva un access token usando un refresh token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  // Buscar el refresh token en la base de datos
  const refreshTokens = await RefreshToken.findAll({
    where: {
      revokedAt: null,
    },
  });

  // Verificar cada token hasheado
  let validRefreshToken: RefreshToken | null = null;
  for (const tokenRecord of refreshTokens) {
    const isMatch = await bcrypt.compare(refreshToken, tokenRecord.token);
    if (isMatch) {
      validRefreshToken = tokenRecord;
      break;
    }
  }

  if (!validRefreshToken) {
    throw new UnauthorizedError('Refresh token inválido o revocado');
  }

  // Verificar que no esté expirado
  const now = DateTime.now();
  const expiresAt = DateTime.fromJSDate(validRefreshToken.expiresAt);

  if (now >= expiresAt) {
    // Marcar como revocado si está expirado
    await validRefreshToken.update({ revokedAt: now.toJSDate() });
    throw new UnauthorizedError('Refresh token expirado');
  }

  // Obtener usuario
  const user = await User.findByPk(validRefreshToken.userId);

  if (!user) {
    throw new UnauthorizedError('Usuario no encontrado');
  }

  // Generar nuevo access token
  const accessToken = generateAccessToken(user.id, user.email);

  logger.info(
    {
      userId: user.id,
      refreshTokenId: validRefreshToken.id,
    },
    'Access token renovado exitosamente'
  );

  return {
    accessToken,
    expiresIn: getExpiresInSeconds(JWT_ACCESS_EXPIRES_IN),
  };
};

/**
 * Revoca un refresh token
 */
export const revokeRefreshToken = async (refreshToken: string): Promise<void> => {
  // Buscar el refresh token en la base de datos
  const refreshTokens = await RefreshToken.findAll({
    where: {
      revokedAt: null,
    },
  });

  // Verificar cada token hasheado
  let validRefreshToken: RefreshToken | null = null;
  for (const tokenRecord of refreshTokens) {
    const isMatch = await bcrypt.compare(refreshToken, tokenRecord.token);
    if (isMatch) {
      validRefreshToken = tokenRecord;
      break;
    }
  }

  if (!validRefreshToken) {
    // Si no se encuentra, no hacer nada (idempotente)
    return;
  }

  // Marcar como revocado
  await validRefreshToken.update({
    revokedAt: DateTime.now().toJSDate(),
  });

  logger.info(
    {
      refreshTokenId: validRefreshToken.id,
      userId: validRefreshToken.userId,
    },
    'Refresh token revocado exitosamente'
  );
};

/**
 * Verifica el correo electrónico del usuario usando el token
 */
export const verifyEmail = async (token: string): Promise<void> => {
  if (!token || token.length < 10) {
    throw new BadRequestError('Token de verificación inválido');
  }

  // Buscar usuarios con token de verificación pendiente
  const usersWithPendingVerification = await User.findAll({
    where: {
      emailVerified: false,
      emailVerificationToken: { [Op.ne]: null },
      emailVerificationExpiresAt: { [Op.gt]: new Date() },
    },
  });

  let verifiedUser: User | null = null;
  for (const u of usersWithPendingVerification) {
    const isMatch = await bcrypt.compare(token, u.emailVerificationToken!);
    if (isMatch) {
      verifiedUser = u;
      break;
    }
  }

  if (!verifiedUser) {
    throw new BadRequestError('Token de verificación inválido o expirado. Solicita uno nuevo.');
  }

  await verifiedUser.update({
    emailVerified: true,
    emailVerificationToken: null,
    emailVerificationExpiresAt: null,
  });

  logger.info(
    { userId: verifiedUser.id, email: verifiedUser.email },
    'Correo electrónico verificado exitosamente'
  );
};

/**
 * Reenvía el email de verificación
 */
export const resendVerificationEmail = async (email: string): Promise<void> => {
  const user = await User.findOne({
    where: { email: email.toLowerCase().trim() },
  });

  // Por seguridad: respuesta genérica si no existe o ya está verificado
  if (!user || user.emailVerified) {
    return;
  }

  // Generar nuevo token
  const { token: verificationToken, hashedToken: hashedVerificationToken } =
    await generateVerificationToken();
  const verificationExpiresAt = DateTime.now()
    .plus({ hours: EMAIL_VERIFICATION_EXPIRES_HOURS })
    .toJSDate();

  await user.update({
    emailVerificationToken: hashedVerificationToken,
    emailVerificationExpiresAt: verificationExpiresAt,
  });

  await sendVerificationEmail({
    to: user.email,
    name: user.name,
    token: verificationToken,
  });

  logger.info({ userId: user.id, email: user.email }, 'Email de verificación reenviado');
};

/**
 * Envía email de recuperación de contraseña.
 * Por seguridad, no revela si el email existe o no.
 */
export const forgotPassword = async (email: string): Promise<void> => {
  const user = await User.findOne({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    return;
  }

  const { token: resetToken, hashedToken: hashedResetToken } = await generateVerificationToken();
  const resetExpiresAt = DateTime.now().plus({ hours: PASSWORD_RESET_EXPIRES_HOURS }).toJSDate();

  await user.update({
    passwordResetToken: hashedResetToken,
    passwordResetExpiresAt: resetExpiresAt,
  });

  await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    token: resetToken,
  });

  logger.info(
    { userId: user.id, email: user.email },
    'Email de recuperación de contraseña enviado'
  );
};

/**
 * Restablece la contraseña usando el token enviado por email.
 */
export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  if (!token || token.length < 10) {
    throw new BadRequestError('Token de recuperación inválido');
  }

  const usersWithPendingReset = await User.findAll({
    where: {
      passwordResetToken: { [Op.ne]: null },
      passwordResetExpiresAt: { [Op.gt]: new Date() },
    },
  });

  let targetUser: User | null = null;
  for (const u of usersWithPendingReset) {
    const isMatch = await bcrypt.compare(token, u.passwordResetToken!);
    if (isMatch) {
      targetUser = u;
      break;
    }
  }

  if (!targetUser) {
    throw new BadRequestError('Token de recuperación inválido o expirado. Solicita uno nuevo.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await targetUser.update({
    password: hashedPassword,
    passwordResetToken: null,
    passwordResetExpiresAt: null,
  });

  logger.info(
    { userId: targetUser.id, email: targetUser.email },
    'Contraseña restablecida exitosamente'
  );
};

/**
 * Revoca todos los refresh tokens de un usuario
 */
export const revokeAllUserRefreshTokens = async (userId: UUID): Promise<void> => {
  const now = DateTime.now().toJSDate();

  await RefreshToken.update(
    {
      revokedAt: now,
    },
    {
      where: {
        userId,
        revokedAt: null,
      },
    }
  );

  logger.info(
    {
      userId,
    },
    'Todos los refresh tokens del usuario fueron revocados'
  );
};
