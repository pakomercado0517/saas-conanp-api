import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { DateTime } from 'luxon';
import { randomBytes } from 'crypto';
import { User } from '../../../modules/users/models/user.model.js';
import { RefreshToken } from '../../../modules/auth/models/refresh-token.model.js';
import { ConflictError, UnauthorizedError, BadRequestError } from '../../../shared/errors/index.js';
import { logger } from '../../../shared/logger/index.js';
import { sendVerificationEmail } from '../../../shared/email/index.js';
/**
 * Configuración de JWT
 */
const JWT_SECRET = process.env['JWT_SECRET'];
const JWT_ACCESS_EXPIRES_IN = process.env['JWT_ACCESS_EXPIRES_IN'] || '15m'; // 15 minutos por defecto
const JWT_REFRESH_EXPIRES_IN = process.env['JWT_REFRESH_EXPIRES_IN'] || '7d'; // 7 días por defecto
const BCRYPT_ROUNDS = 10; // Mínimo según reglas del proyecto
/**
 * Valida que las variables de entorno requeridas estén configuradas
 */
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no está definida en las variables de entorno');
}
// Asegurar que JWT_SECRET sea string para TypeScript
const JWT_SECRET_STRING = JWT_SECRET;
/**
 * Calcula la expiración en segundos desde ahora
 */
const getExpiresInSeconds = (expiresIn) => {
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
 * Genera un access token JWT
 */
const generateAccessToken = (userId, email) => {
    const payload = {
        userId,
        email,
        type: 'access',
    };
    return jwt.sign(payload, JWT_SECRET_STRING, {
        expiresIn: JWT_ACCESS_EXPIRES_IN,
    });
};
/**
 * Genera un refresh token aleatorio y lo hashea
 */
const generateRefreshToken = async () => {
    const token = randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(token, BCRYPT_ROUNDS);
    return { token, hashedToken };
};
/**
 * Calcula la fecha de expiración del refresh token
 */
const getRefreshTokenExpiration = () => {
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
    let expiration;
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
/**
 * Genera un token de verificación de email (plain) y su hash
 */
const generateVerificationToken = async () => {
    const token = randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(token, BCRYPT_ROUNDS);
    return { token, hashedToken };
};
/**
 * Registra un nuevo usuario
 * Envía email de verificación. El usuario debe verificar su correo antes de poder iniciar sesión.
 */
export const register = async (data) => {
    // Verificar si el email ya existe
    const existingUser = await User.findOne({
        where: { email: data.email },
    });
    if (existingUser) {
        throw new ConflictError('El email ya está registrado', {
            email: data.email,
        });
    }
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    // Generar token de verificación
    const { token: verificationToken, hashedToken: hashedVerificationToken } = await generateVerificationToken();
    const verificationExpiresAt = DateTime.now()
        .plus({ hours: EMAIL_VERIFICATION_EXPIRES_HOURS })
        .toJSDate();
    // Crear usuario (sin verificar)
    const user = await User.create({
        email: data.email,
        password: hashedPassword,
        name: data.name,
        emailVerified: false,
        emailVerificationToken: hashedVerificationToken,
        emailVerificationExpiresAt: verificationExpiresAt,
    });
    // Enviar email de verificación
    await sendVerificationEmail({
        to: user.email,
        name: user.name,
        token: verificationToken,
    });
    logger.info({
        userId: user.id,
        email: user.email,
    }, 'Usuario registrado, email de verificación enviado');
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
export const login = async (data) => {
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
    logger.info({
        userId: user.id,
        email: user.email,
    }, 'Usuario inició sesión exitosamente');
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
export const validateToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET_STRING);
        // Verificar que sea un access token
        if (decoded.type !== 'access') {
            throw new UnauthorizedError('Tipo de token inválido');
        }
        return decoded;
    }
    catch (error) {
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
export const refreshAccessToken = async (refreshToken) => {
    // Buscar el refresh token en la base de datos
    const refreshTokens = await RefreshToken.findAll({
        where: {
            revokedAt: null,
        },
    });
    // Verificar cada token hasheado
    let validRefreshToken = null;
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
    logger.info({
        userId: user.id,
        refreshTokenId: validRefreshToken.id,
    }, 'Access token renovado exitosamente');
    return {
        accessToken,
        expiresIn: getExpiresInSeconds(JWT_ACCESS_EXPIRES_IN),
    };
};
/**
 * Revoca un refresh token
 */
export const revokeRefreshToken = async (refreshToken) => {
    // Buscar el refresh token en la base de datos
    const refreshTokens = await RefreshToken.findAll({
        where: {
            revokedAt: null,
        },
    });
    // Verificar cada token hasheado
    let validRefreshToken = null;
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
    logger.info({
        refreshTokenId: validRefreshToken.id,
        userId: validRefreshToken.userId,
    }, 'Refresh token revocado exitosamente');
};
/**
 * Verifica el correo electrónico del usuario usando el token
 */
export const verifyEmail = async (token) => {
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
    let verifiedUser = null;
    for (const u of usersWithPendingVerification) {
        const isMatch = await bcrypt.compare(token, u.emailVerificationToken);
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
    logger.info({ userId: verifiedUser.id, email: verifiedUser.email }, 'Correo electrónico verificado exitosamente');
};
/**
 * Reenvía el email de verificación
 */
export const resendVerificationEmail = async (email) => {
    const user = await User.findOne({
        where: { email: email.toLowerCase().trim() },
    });
    // Por seguridad: respuesta genérica si no existe o ya está verificado
    if (!user || user.emailVerified) {
        return;
    }
    // Generar nuevo token
    const { token: verificationToken, hashedToken: hashedVerificationToken } = await generateVerificationToken();
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
 * Revoca todos los refresh tokens de un usuario
 */
export const revokeAllUserRefreshTokens = async (userId) => {
    const now = DateTime.now().toJSDate();
    await RefreshToken.update({
        revokedAt: now,
    }, {
        where: {
            userId,
            revokedAt: null,
        },
    });
    logger.info({
        userId,
    }, 'Todos los refresh tokens del usuario fueron revocados');
};
//# sourceMappingURL=auth.service.js.map