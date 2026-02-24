import bcrypt from 'bcrypt';
import { User } from '@/modules/users/models/user.model.js';
import { Membership } from '@/modules/users/models/membership.model.js';
import type { UpdateProfileDTO, ChangePasswordDTO } from '../validators/user.validator.js';
import {
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from '@/shared/errors/index.js';
import { logger } from '@/shared/logger/index.js';
import type { UUID } from '@/shared/database/types.js';
import { revokeAllUserRefreshTokens } from '@/modules/auth/services/auth.service.js';

/**
 * Configuración de bcrypt
 */
const BCRYPT_ROUNDS = 10; // Mínimo según reglas del proyecto

/**
 * Perfil de usuario sin información sensible
 */
export interface UserProfile {
  id: UUID;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Obtiene el perfil del usuario autenticado
 *
 * @param userId - ID del usuario autenticado (del JWT)
 * @returns Perfil del usuario sin password
 * @throws {NotFoundError} Si el usuario no existe
 */
export const getUserProfile = async (userId: UUID): Promise<UserProfile> => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new NotFoundError('Usuario', { userId });
  }

  // Retornar perfil sin password
  const { ...userProfile } = user.toJSON();
  return userProfile as UserProfile;
};

/**
 * Actualiza el perfil del usuario autenticado
 *
 * @param userId - ID del usuario autenticado (del JWT)
 * @param data - Datos a actualizar (email y/o name)
 * @returns Perfil del usuario actualizado sin password
 * @throws {NotFoundError} Si el usuario no existe
 * @throws {ConflictError} Si el email ya está en uso por otro usuario
 */
export const updateProfile = async (userId: UUID, data: UpdateProfileDTO): Promise<UserProfile> => {
  // Verificar que el usuario existe
  const user = await User.findByPk(userId);

  if (!user) {
    throw new NotFoundError('Usuario', { userId });
  }

  // Si se actualiza email, verificar que no esté en uso
  if (data.email) {
    const existingUser = await User.findOne({
      where: { email: data.email },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictError('El email ya está registrado', {
        email: data.email,
        userId,
      });
    }
  }

  // Actualizar solo los campos proporcionados
  if (data.email !== undefined) {
    user.email = data.email;
  }
  if (data.name !== undefined) {
    user.name = data.name;
  }

  await user.save();

  logger.info(
    {
      userId: user.id,
      updatedFields: Object.keys(data),
    },
    'Perfil de usuario actualizado exitosamente'
  );

  // Retornar perfil sin password
  const { ...userProfile } = user.toJSON();
  return userProfile as UserProfile;
};

/**
 * Cambia la contraseña del usuario autenticado
 *
 * @param userId - ID del usuario autenticado (del JWT)
 * @param data - Datos de cambio de contraseña (currentPassword, newPassword)
 * @throws {NotFoundError} Si el usuario no existe
 * @throws {UnauthorizedError} Si la contraseña actual es incorrecta
 */
export const changePassword = async (userId: UUID, data: ChangePasswordDTO): Promise<void> => {
  // Verificar que el usuario existe
  const user = await User.findByPk(userId);

  if (!user) {
    throw new NotFoundError('Usuario', { userId });
  }

  // Verificar que la contraseña actual sea correcta
  const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Contraseña actual incorrecta');
  }

  // Hashear la nueva contraseña
  const hashedPassword = await bcrypt.hash(data.newPassword, BCRYPT_ROUNDS);

  // Actualizar la contraseña
  user.password = hashedPassword;
  await user.save();

  // Revocar todos los refresh tokens del usuario para forzar re-autenticación
  // Esto mejora la seguridad al invalidar sesiones existentes
  await revokeAllUserRefreshTokens(userId);

  logger.info(
    {
      userId: user.id,
    },
    'Contraseña actualizada exitosamente'
  );
};

/**
 * Elimina el usuario autenticado (soft delete)
 *
 * Realiza las siguientes acciones:
 * 1. Verifica que el usuario existe
 * 2. Valida que no tenga membresías activas
 * 3. Revoca todos los refresh tokens
 * 4. Anonimiza datos personales (email y name) para mantener unicidad
 * 5. Realiza soft delete del usuario
 *
 * @param userId - ID del usuario autenticado (del JWT)
 * @throws {NotFoundError} Si el usuario no existe
 * @throws {ValidationError} Si el usuario tiene membresías activas
 */
export const deleteUser = async (userId: UUID): Promise<void> => {
  // Verificar que el usuario existe
  const user = await User.findByPk(userId);

  if (!user) {
    throw new NotFoundError('Usuario', { userId });
  }

  // Verificar que no tenga membresías activas
  const activeMemberships = await Membership.findAll({
    where: {
      userId,
      status: 'activo',
    },
  });

  if (activeMemberships.length > 0) {
    const details = {
      userId,
      activeMembershipsCount: activeMemberships.length,
      organizationIds: activeMemberships.map((m) => m.areaId),
    };
    throw new ValidationError(
      'No se puede eliminar el usuario porque tiene membresías activas en organizaciones. Por favor, contacta a los administradores de las organizaciones para que eliminen tu membresía primero.',
      undefined,
      details
    );
  }

  // Revocar todos los refresh tokens del usuario
  await revokeAllUserRefreshTokens(userId);

  // Anonimizar datos personales antes de eliminar
  // Esto mantiene la unicidad del email y preserva la integridad referencial
  const anonymizedEmail = `deleted_${userId}@deleted.local`;
  const anonymizedName = 'Usuario Eliminado';

  // Verificar que el email anonimizado no esté en uso (muy improbable pero por seguridad)
  const existingDeletedUser = await User.findOne({
    where: { email: anonymizedEmail },
    paranoid: false, // Incluir usuarios eliminados en la búsqueda
  });

  if (existingDeletedUser && existingDeletedUser.id !== userId) {
    // Si por alguna razón el email ya existe, usar timestamp
    user.email = `deleted_${userId}_${Date.now()}@deleted.local`;
  } else {
    user.email = anonymizedEmail;
  }

  user.name = anonymizedName;
  await user.save();

  // Realizar soft delete
  await user.destroy();

  logger.info(
    {
      userId: user.id,
      anonymizedEmail: user.email,
    },
    'Usuario eliminado exitosamente (soft delete)'
  );
};
