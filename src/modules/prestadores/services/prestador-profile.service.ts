import type { UUID } from '@/shared/database/types.js';
import { PrestadorProfile } from '@/modules/prestadores/models/prestador-profile.model.js';
import { Membership } from '@/modules/users/models/membership.model.js';
import { User } from '@/modules/users/models/user.model.js';
import { Organization } from '@/modules/organizations/models/organization.model.js';
import type {
  CreatePrestadorProfileDTO,
  UpdatePrestadorProfileDTO,
  ListPrestadoresDTO,
} from '@/modules/prestadores/validators/prestador-profile.validator.js';
import { ForbiddenError, NotFoundError, ConflictError } from '@/shared/errors/index.js';
import type { PaginationMeta } from '@/shared/responses/types.js';
import { logger } from '@/shared/logger/index.js';
import { assertCanAccessOrganization } from '@/modules/organizations/services/organization.service.js';
import type { DateTime } from 'luxon';

/**
 * Valida que el usuario tenga una membership activa en la organización.
 *
 * @param userId - ID del usuario a validar
 * @param organizationId - ID de la organización
 * @returns Membership encontrada
 * @throws {ForbiddenError} Si no tiene membership activa en la organización
 */
export const validateUserMembership = async (
  userId: UUID,
  organizationId: UUID
): Promise<Membership> => {
  const membership = await Membership.findOne({
    where: {
      userId,
      organizationId,
      status: 'activo',
    },
  });

  if (!membership) {
    throw new ForbiddenError('No tienes una membresía activa en esta organización', {
      organizationId,
      userId,
    });
  }

  return membership;
};

/**
 * Valida los permisos para acceder a un perfil de prestador.
 * - Los administradores pueden ver/editar cualquier perfil
 * - Los prestadores solo pueden ver/editar su propio perfil
 *
 * @param requestingUserId - ID del usuario que solicita acceso
 * @param profileUserId - ID del usuario del perfil de prestador
 * @param organizationId - ID de la organización
 * @throws {ForbiddenError} Si no tiene permisos para acceder al perfil
 */
export const validatePrestadorPermissions = async (
  requestingUserId: UUID,
  profileUserId: UUID,
  organizationId: UUID
): Promise<void> => {
  // Si es el mismo usuario, permitir acceso
  if (requestingUserId === profileUserId) {
    return;
  }

  // Validar membership del usuario que solicita
  const membership = await validateUserMembership(requestingUserId, organizationId);

  // Solo los administradores pueden acceder a perfiles de otros usuarios
  if (membership.role !== 'admin') {
    throw new ForbiddenError(
      'Solo puedes ver y editar tu propio perfil de prestador. Los administradores pueden gestionar todos los perfiles.',
      {
        organizationId,
        requestingUserId,
        profileUserId,
        currentRole: membership.role,
      }
    );
  }
};

/**
 * Crea un nuevo perfil de prestador.
 * Requiere que el usuario tenga membership activa en la organización.
 * Solo los administradores pueden crear perfiles de prestador.
 *
 * @param data - Datos del perfil de prestador
 * @param creatorUserId - ID del usuario que crea (debe tener membership activa)
 * @returns PrestadorProfile creado con relaciones User y Organization
 * @throws {ForbiddenError} Si no tiene acceso a la organización o no es admin
 * @throws {NotFoundError} Si la organización o usuario no existen
 * @throws {ConflictError} Si ya existe un perfil para ese usuario en esa organización
 * @throws {ValidationError} Si el usuario no tiene membership activa
 */
export const createPrestadorProfile = async (
  data: CreatePrestadorProfileDTO,
  creatorUserId: UUID
): Promise<PrestadorProfile> => {
  // Validar que el creador tenga acceso a la organización
  await assertCanAccessOrganization(creatorUserId, data.organizationId);

  // Validar que el creador sea admin (solo admins pueden crear perfiles)
  const creatorMembership = await validateUserMembership(creatorUserId, data.organizationId);
  if (creatorMembership.role !== 'admin') {
    throw new ForbiddenError('Solo los administradores pueden crear perfiles de prestador', {
      organizationId: data.organizationId,
      userId: creatorUserId,
      currentRole: creatorMembership.role,
    });
  }

  // Validar que el usuario a convertir en prestador tenga membership activa
  await validateUserMembership(data.userId, data.organizationId);

  // Validar que la organización existe
  const organization = await Organization.findByPk(data.organizationId);
  if (!organization) {
    throw new NotFoundError('Organización', { organizationId: data.organizationId });
  }

  // Validar que el usuario existe
  const user = await User.findByPk(data.userId);
  if (!user) {
    throw new NotFoundError('Usuario', { userId: data.userId });
  }

  // Verificar si ya existe un perfil para ese usuario en esa organización
  const existingProfile = await PrestadorProfile.findOne({
    where: {
      userId: data.userId,
      organizationId: data.organizationId,
    },
  });

  if (existingProfile) {
    throw new ConflictError('El usuario ya tiene un perfil de prestador en esta organización', {
      userId: data.userId,
      organizationId: data.organizationId,
      existingProfileId: existingProfile.id,
    });
  }

  // Convertir permitExpiresAt de DateTime a Date si está presente
  let permitExpiresAtDate: Date | null | undefined = undefined;
  if (data['permitExpiresAt'] !== undefined) {
    if (
      data['permitExpiresAt'] &&
      typeof data['permitExpiresAt'] === 'object' &&
      'toJSDate' in data['permitExpiresAt']
    ) {
      permitExpiresAtDate = (data['permitExpiresAt'] as DateTime).toJSDate();
    } else if (data['permitExpiresAt'] === null) {
      permitExpiresAtDate = null;
    }
  }

  // Crear el perfil
  let profile: PrestadorProfile;
  try {
    const createData: {
      userId: string;
      organizationId: string;
      status: 'activo' | 'inactivo' | 'suspendido';
      permitExpiresAt?: Date | null;
    } = {
      userId: data.userId,
      organizationId: data.organizationId,
      status: data.status ?? 'activo',
    };
    if (permitExpiresAtDate !== undefined) {
      createData.permitExpiresAt = permitExpiresAtDate;
    }
    profile = await PrestadorProfile.create(createData);
  } catch (error) {
    // Capturar error de constraint único
    if (
      error instanceof Error &&
      'name' in error &&
      error.name === 'SequelizeUniqueConstraintError'
    ) {
      throw new ConflictError('El usuario ya tiene un perfil de prestador en esta organización', {
        userId: data.userId,
        organizationId: data.organizationId,
      });
    }
    throw error;
  }

  // Cargar relaciones para retornar datos completos
  await profile.reload({
    include: [
      { model: User, as: 'User' },
      { model: Organization, as: 'Organization' },
    ],
  });

  logger.info(
    {
      profileId: profile.id,
      organizationId: profile.organizationId,
      userId: profile.userId,
      status: profile.status,
      creatorUserId,
    },
    'Perfil de prestador creado exitosamente'
  );

  return profile;
};

/**
 * Obtiene un perfil de prestador por ID.
 * - Los administradores pueden ver cualquier perfil
 * - Los prestadores solo pueden ver su propio perfil
 *
 * @param profileId - ID del perfil de prestador
 * @param organizationId - ID de la organización (multi-tenant)
 * @param requestingUserId - ID del usuario que solicita
 * @returns PrestadorProfile encontrado con relaciones User y Organization
 * @throws {ForbiddenError} Si no tiene acceso a la organización o no tiene permisos
 * @throws {NotFoundError} Si el perfil no existe o no pertenece a la organización
 */
export const getPrestadorProfileById = async (
  profileId: UUID,
  organizationId: UUID,
  requestingUserId: UUID
): Promise<PrestadorProfile> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(requestingUserId, organizationId);

  // Buscar perfil con filtro multi-tenant
  const profile = await PrestadorProfile.findOne({
    where: {
      id: profileId,
      organizationId, // Multi-tenant obligatorio
    },
    include: [
      { model: User, as: 'User' },
      { model: Organization, as: 'Organization' },
    ],
  });

  if (!profile) {
    throw new NotFoundError('Perfil de prestador', { profileId, organizationId });
  }

  // Validar permisos: prestador solo puede ver su propio perfil
  await validatePrestadorPermissions(requestingUserId, profile.userId, organizationId);

  return profile;
};

/**
 * Lista prestadores con paginación y filtros.
 * - Los administradores pueden ver todos los prestadores
 * - Los prestadores solo pueden ver su propio perfil
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros de paginación, ordenamiento y filtros
 * @param requestingUserId - ID del usuario que solicita
 * @returns Datos paginados de prestadores con relaciones User y Organization
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 */
export const listPrestadores = async (
  organizationId: UUID,
  filters: ListPrestadoresDTO,
  requestingUserId: UUID
): Promise<{ data: PrestadorProfile[]; pagination: PaginationMeta }> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(requestingUserId, organizationId);

  // Obtener membership del usuario para determinar permisos
  const membership = await validateUserMembership(requestingUserId, organizationId);

  // Construir query con filtros multi-tenant obligatorio
  const where: Record<string, unknown> = {
    organizationId, // Multi-tenant obligatorio
  };

  // Si el usuario es prestador, solo puede ver su propio perfil
  if (membership.role === 'prestador') {
    where['userId'] = requestingUserId;
  }

  // Aplicar filtros opcionales
  if (filters.status) {
    where['status'] = filters.status;
  }
  if (filters.userId) {
    where['userId'] = filters.userId;
  }
  if (filters['permitExpiresAt']) {
    // Si permitExpiresAt viene como DateTime, convertir a Date para la query
    const permitExpiresAtDate =
      filters['permitExpiresAt'] &&
      typeof filters['permitExpiresAt'] === 'object' &&
      'toJSDate' in filters['permitExpiresAt']
        ? (filters['permitExpiresAt'] as DateTime).toJSDate()
        : filters['permitExpiresAt'];
    where['permitExpiresAt'] = permitExpiresAtDate;
  }

  // Configurar paginación
  const limit = filters.limit;
  const sortBy = filters.sortBy ?? 'createdAt';
  const sortOrder = filters.sortOrder ?? 'desc';
  const offset = (filters.page - 1) * limit;

  // Ejecutar query con paginación
  const result = await PrestadorProfile.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sortBy, sortOrder]],
    include: [
      { model: User, as: 'User' },
      { model: Organization, as: 'Organization' },
    ],
  });

  const total = result.count as number;
  const totalPages = Math.ceil(total / limit);

  const pagination: PaginationMeta = {
    page: filters.page,
    limit,
    total,
    totalPages,
  };

  return { data: result.rows, pagination };
};

/**
 * Actualiza un perfil de prestador existente.
 * - Los administradores pueden actualizar cualquier perfil
 * - Los prestadores solo pueden actualizar su propio perfil
 *
 * @param profileId - ID del perfil a actualizar
 * @param organizationId - ID de la organización (multi-tenant)
 * @param data - Datos a actualizar
 * @param requestingUserId - ID del usuario que actualiza
 * @returns PrestadorProfile actualizado con relaciones User y Organization
 * @throws {ForbiddenError} Si no tiene acceso o no tiene permisos
 * @throws {NotFoundError} Si el perfil no existe o no pertenece a la organización
 */
export const updatePrestadorProfile = async (
  profileId: UUID,
  organizationId: UUID,
  data: UpdatePrestadorProfileDTO,
  requestingUserId: UUID
): Promise<PrestadorProfile> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(requestingUserId, organizationId);

  // Buscar perfil con filtro multi-tenant
  const profile = await PrestadorProfile.findOne({
    where: {
      id: profileId,
      organizationId, // Multi-tenant obligatorio
    },
  });

  if (!profile) {
    throw new NotFoundError('Perfil de prestador', { profileId, organizationId });
  }

  // Validar permisos: prestador solo puede editar su propio perfil
  await validatePrestadorPermissions(requestingUserId, profile.userId, organizationId);

  // Preparar datos de actualización
  const updateData: Partial<{
    status: 'activo' | 'inactivo' | 'suspendido';
    permitExpiresAt: Date | null;
  }> = {};

  if (data.status !== undefined) {
    updateData.status = data.status;
  }
  if (data['permitExpiresAt'] !== undefined) {
    // Convertir permitExpiresAt de DateTime a Date si está presente
    if (
      data['permitExpiresAt'] &&
      typeof data['permitExpiresAt'] === 'object' &&
      'toJSDate' in data['permitExpiresAt']
    ) {
      updateData.permitExpiresAt = (data['permitExpiresAt'] as DateTime).toJSDate();
    } else {
      // Si es null o cualquier otro valor, asignar null
      updateData.permitExpiresAt = null;
    }
  }

  await profile.update(updateData);

  // Cargar relaciones para retornar datos completos
  await profile.reload({
    include: [
      { model: User, as: 'User' },
      { model: Organization, as: 'Organization' },
    ],
  });

  const updatedKeys = [
    data.status !== undefined && 'status',
    data['permitExpiresAt'] !== undefined && 'permitExpiresAt',
  ].filter(Boolean) as string[];

  logger.info(
    {
      profileId: profile.id,
      organizationId,
      userId: profile.userId,
      updatedFields: updatedKeys,
      requestingUserId,
    },
    'Perfil de prestador actualizado exitosamente'
  );

  return profile;
};
