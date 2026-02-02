import { Op } from 'sequelize';
import type { UUID, AgendaType } from '@/shared/database/types';
import { Actividad } from '@/modules/actividades/models/actividad.model';
import type {
  CreateActividadDTO,
  UpdateActividadDTO,
  ListActividadesDTO,
} from '@/modules/actividades/validators/actividad.validator';
import { NotFoundError, ValidationError } from '@/shared/errors';
import type { PaginationMeta } from '@/shared/responses/types';
import { logger } from '@/shared/logger';
import { assertCanAccessOrganization } from '@/modules/organizations/services/organization.service';
import { assertIsAdmin } from '@/modules/users/services/membership.service';
import { checkActividadesLimit } from '@/modules/subscriptions/services/subscription-limits.service';

/**
 * Valida que el tipo de agenda sea válido
 *
 * @param agendaType - Tipo de agenda a validar
 * @throws {ValidationError} Si el tipo de agenda no es válido
 */
const validateAgendaType = (agendaType: string): void => {
  const validTypes: AgendaType[] = ['BLOQUES', 'HORARIO_LIBRE'];
  if (!validTypes.includes(agendaType as AgendaType)) {
    throw new ValidationError(`El tipo de agenda debe ser: ${validTypes.join(' o ')}`, undefined, {
      agendaType,
    });
  }
};

/**
 * Crea una nueva actividad.
 * Solo los administradores pueden crear actividades.
 *
 * @param data - Datos de la actividad
 * @param userId - ID del usuario que crea (debe ser admin)
 * @returns Actividad creada
 * @throws {ForbiddenError} Si no es admin
 * @throws {NotFoundError} Si la organización no existe
 * @throws {ValidationError} Si el tipo de agenda no es válido
 */
export const createActividad = async (
  data: CreateActividadDTO,
  userId: UUID
): Promise<Actividad> => {
  // Validar que el usuario sea admin
  await assertIsAdmin(userId, data.organizationId);

  // Validar acceso a la organización (también verifica que existe)
  await assertCanAccessOrganization(userId, data.organizationId);

  // Validar tipo de agenda
  validateAgendaType(data.agendaType);

  // Validar límite de actividades del plan de suscripción
  await checkActividadesLimit(data.organizationId);

  // Crear la actividad
  const actividad = await Actividad.create({
    organizationId: data.organizationId,
    name: data.name,
    type: data.type,
    agendaType: data.agendaType,
    requiresGuide: data.requiresGuide ?? false,
    impactLevel: data.impactLevel ?? null,
    active: data.active ?? true,
  });

  logger.info(
    {
      actividadId: actividad.id,
      organizationId: actividad.organizationId,
      name: actividad.name,
      agendaType: actividad.agendaType,
      userId,
    },
    'Actividad creada exitosamente'
  );

  return actividad;
};

/**
 * Obtiene una actividad por ID.
 * Cualquier usuario con acceso a la organización puede leer actividades.
 *
 * @param actividadId - ID de la actividad
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que solicita
 * @returns Actividad encontrada
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si la actividad no existe o no pertenece a la organización
 */
export const getActividadById = async (
  actividadId: UUID,
  organizationId: UUID,
  userId: UUID
): Promise<Actividad> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(userId, organizationId);

  // Buscar actividad con filtro multi-tenant
  // Nota: paranoid: true en el modelo excluye automáticamente registros eliminados
  const actividad = await Actividad.findOne({
    where: {
      id: actividadId,
      organizationId, // Multi-tenant obligatorio
    },
  });

  if (!actividad) {
    throw new NotFoundError('Actividad', { actividadId, organizationId });
  }

  return actividad;
};

/**
 * Lista actividades con paginación y filtros.
 * Cualquier usuario con acceso a la organización puede listar actividades.
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros de paginación y búsqueda
 * @param userId - ID del usuario que solicita
 * @returns Datos paginados de actividades
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 */
export const listActividades = async (
  organizationId: UUID,
  filters: ListActividadesDTO,
  userId: UUID
): Promise<{ data: Actividad[]; pagination: PaginationMeta }> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(userId, organizationId);

  // Construir query con filtros multi-tenant obligatorio
  // Nota: paranoid: true en el modelo excluye automáticamente registros eliminados
  const where: Record<string, unknown> = {
    organizationId, // Multi-tenant obligatorio
  };

  // Aplicar filtros opcionales
  if (filters.name) {
    where['name'] = { [Op.iLike]: `%${filters.name}%` };
  }
  if (filters.type) {
    where['type'] = filters.type;
  }
  if (filters.agendaType) {
    where['agendaType'] = filters.agendaType;
  }
  if (filters.active !== undefined) {
    where['active'] = filters.active;
  }
  if (filters.requiresGuide !== undefined) {
    where['requiresGuide'] = filters.requiresGuide;
  }

  // Configurar paginación
  const limit = filters.limit;
  const sortBy = filters.sortBy ?? 'createdAt';
  const sortOrder = filters.sortOrder ?? 'desc';
  const offset = (filters.page - 1) * limit;

  // Ejecutar query con paginación
  const result = await Actividad.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sortBy, sortOrder]],
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
 * Actualiza una actividad existente.
 * Solo los administradores pueden actualizar actividades.
 *
 * @param actividadId - ID de la actividad
 * @param organizationId - ID de la organización (multi-tenant)
 * @param data - Datos a actualizar
 * @param userId - ID del usuario que actualiza (debe ser admin)
 * @returns Actividad actualizada
 * @throws {ForbiddenError} Si no es admin o no tiene acceso
 * @throws {NotFoundError} Si la actividad no existe o no pertenece a la organización
 * @throws {ValidationError} Si el tipo de agenda no es válido
 */
export const updateActividad = async (
  actividadId: UUID,
  organizationId: UUID,
  data: UpdateActividadDTO,
  userId: UUID
): Promise<Actividad> => {
  // Validar que el usuario sea admin
  await assertIsAdmin(userId, organizationId);

  // Validar acceso a la organización
  await assertCanAccessOrganization(userId, organizationId);

  // Buscar actividad con filtro multi-tenant
  // Nota: paranoid: true en el modelo excluye automáticamente registros eliminados
  const actividad = await Actividad.findOne({
    where: {
      id: actividadId,
      organizationId, // Multi-tenant obligatorio
    },
  });

  if (!actividad) {
    throw new NotFoundError('Actividad', { actividadId, organizationId });
  }

  // Validar tipo de agenda si se actualiza
  if (data.agendaType !== undefined) {
    validateAgendaType(data.agendaType);
  }

  // Actualizar solo los campos proporcionados
  const updateData: Partial<{
    name: string;
    type: 'terrestre' | 'maritima' | 'mixta';
    agendaType: AgendaType;
    requiresGuide: boolean;
    impactLevel: string | null;
    active: boolean;
  }> = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }
  if (data.type !== undefined) {
    updateData.type = data.type;
  }
  if (data.agendaType !== undefined) {
    updateData.agendaType = data.agendaType;
  }
  if (data.requiresGuide !== undefined) {
    updateData.requiresGuide = data.requiresGuide;
  }
  if (data.impactLevel !== undefined) {
    updateData.impactLevel = data.impactLevel;
  }
  if (data.active !== undefined) {
    updateData.active = data.active;
  }

  await actividad.update(updateData);

  const updatedKeys = Object.keys(updateData);

  logger.info(
    {
      actividadId: actividad.id,
      organizationId,
      updatedFields: updatedKeys,
      userId,
    },
    'Actividad actualizada exitosamente'
  );

  return actividad;
};

/**
 * Elimina una actividad (soft delete).
 * Solo los administradores pueden eliminar actividades.
 *
 * @param actividadId - ID de la actividad
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que elimina (debe ser admin)
 * @throws {ForbiddenError} Si no es admin o no tiene acceso
 * @throws {NotFoundError} Si la actividad no existe o no pertenece a la organización
 */
export const deleteActividad = async (
  actividadId: UUID,
  organizationId: UUID,
  userId: UUID
): Promise<void> => {
  // Validar que el usuario sea admin
  await assertIsAdmin(userId, organizationId);

  // Validar acceso a la organización
  await assertCanAccessOrganization(userId, organizationId);

  // Buscar actividad con filtro multi-tenant
  // Nota: paranoid: true en el modelo excluye automáticamente registros eliminados
  const actividad = await Actividad.findOne({
    where: {
      id: actividadId,
      organizationId, // Multi-tenant obligatorio
    },
  });

  if (!actividad) {
    throw new NotFoundError('Actividad', { actividadId, organizationId });
  }

  // Realizar soft delete
  // Nota: Con paranoid: true configurado en el modelo, destroy() automáticamente
  // hace soft delete (actualiza deletedAt) en lugar de eliminar físicamente
  await actividad.destroy();

  logger.info(
    {
      actividadId,
      organizationId,
      userId,
    },
    'Actividad eliminada exitosamente (soft delete)'
  );
};
