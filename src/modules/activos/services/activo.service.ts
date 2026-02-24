import type { UUID } from '@/shared/database/types.js';
import { Activo } from '@/modules/activos/models/activo.model.js';
import { PrestadorProfile } from '@/modules/prestadores/models/prestador-profile.model.js';
import { User } from '@/modules/users/models/user.model.js';
import { Area } from '@/modules/areas/models/area.model.js';
import { Dependencia } from '@/modules/dependencias/models/dependencia.model.js';
import type {
  CreateActivoDTO,
  UpdateActivoDTO,
  ListActivosDTO,
} from '@/modules/activos/validators/activo.validator.js';
import { NotFoundError, ValidationError } from '@/shared/errors/index.js';
import type { PaginationMeta } from '@/shared/responses/types.js';
import { logger } from '@/shared/logger/index.js';
import { assertCanAccessOrganization } from '@/modules/organizations/services/organization.service.js';
import { checkActivosLimit } from '@/modules/subscriptions/services/subscription-limits.service.js';

/** Resuelve areaId (organizationId en API) a dependenciaId para Activo (activos son por dependencia). */
const getDependenciaIdFromAreaId = async (areaId: UUID): Promise<UUID> => {
  const area = await Area.findByPk(areaId);
  if (!area) {
    throw new NotFoundError('Área', { areaId });
  }
  return area.dependenciaId;
};

/**
 * Tipo para estados de activo
 */
export type ActivoStatus = 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido';

/**
 * Valida que una transición de estado sea válida según las reglas de negocio.
 *
 * Transiciones válidas:
 * - pendiente → aprobado, rechazado
 * - aprobado → suspendido
 * - rechazado → pendiente
 * - suspendido → aprobado
 *
 * @param currentStatus - Estado actual del activo
 * @param newStatus - Nuevo estado deseado
 * @throws {ValidationError} Si la transición no es válida
 */
export const validateEstadoTransition = (
  currentStatus: ActivoStatus,
  newStatus: ActivoStatus
): void => {
  const transicionesValidas: Record<ActivoStatus, ActivoStatus[]> = {
    pendiente: ['aprobado', 'rechazado'],
    aprobado: ['suspendido'],
    rechazado: ['pendiente'],
    suspendido: ['aprobado'],
  };

  const estadosPermitidos = transicionesValidas[currentStatus];

  if (!estadosPermitidos || !estadosPermitidos.includes(newStatus)) {
    throw new ValidationError(`No se puede cambiar de ${currentStatus} a ${newStatus}`, undefined, {
      currentStatus,
      newStatus,
      estadosPermitidos,
    });
  }
};

/**
 * Valida que un activo esté aprobado y pueda usarse.
 * Esta función se exporta para uso en otros services (ej: eventos operativos).
 *
 * @param activoId - ID del activo
 * @param organizationId - ID de la organización (multi-tenant)
 * @returns Activo aprobado
 * @throws {NotFoundError} Si el activo no existe o no pertenece a la organización
 * @throws {ValidationError} Si el activo no está aprobado
 */
export const validateActivoAprobado = async (activoId: UUID, areaId: UUID): Promise<Activo> => {
  const area = await Area.findByPk(areaId);
  if (!area) {
    throw new NotFoundError('Área', { areaId });
  }
  const dependenciaId = area.dependenciaId;

  const activo = await Activo.findOne({
    where: {
      id: activoId,
      dependenciaId,
      deletedAt: null,
    } as unknown as Record<string, unknown>,
  });

  if (!activo) {
    throw new NotFoundError('Activo', { activoId, areaId });
  }

  if (activo.status !== 'aprobado') {
    throw new ValidationError('Solo los activos aprobados pueden usarse', undefined, {
      activoId,
      areaId,
      status: activo.status,
    });
  }

  return activo;
};

/**
 * Crea un nuevo activo.
 *
 * @param data - Datos del activo
 * @param organizationId - ID de la organización (multi-tenant)
 * @param creatorUserId - ID del usuario que crea
 * @returns Activo creado con relaciones Organization y Owner cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el prestador no existe o no pertenece a la organización
 * @throws {ValidationError} Si el organizationId del data no coincide con el parámetro
 */
export const createActivo = async (
  data: CreateActivoDTO,
  organizationId: UUID,
  creatorUserId: UUID
): Promise<Activo> => {
  await assertCanAccessOrganization(creatorUserId, organizationId);
  await checkActivosLimit(organizationId);

  if (data.organizationId !== organizationId) {
    throw new ValidationError(
      'El ID de organización en los datos no coincide con el parámetro',
      undefined,
      {
        dataOrganizationId: data.organizationId,
        parameterOrganizationId: organizationId,
      }
    );
  }

  const dependenciaId = await getDependenciaIdFromAreaId(organizationId);

  const prestador = await PrestadorProfile.findOne({
    where: { id: data.ownerId, dependenciaId },
  });

  if (!prestador) {
    throw new NotFoundError('Prestador', {
      ownerId: data.ownerId,
      organizationId,
    });
  }

  const activo = await Activo.create({
    dependenciaId,
    ownerId: data.ownerId,
    type: data.type,
    status: data.status ?? 'pendiente',
  });

  await activo.reload({
    include: [
      { model: Dependencia, as: 'Dependencia' },
      { model: PrestadorProfile, as: 'Owner' },
    ],
  });

  logger.info(
    {
      activoId: activo.id,
      dependenciaId: activo.dependenciaId,
      ownerId: activo.ownerId,
      type: activo.type,
      status: activo.status,
      creatorUserId,
    },
    'Activo creado exitosamente'
  );

  return activo;
};

/**
 * Obtiene un activo por ID.
 *
 * @param activoId - ID del activo
 * @param organizationId - ID de la organización (multi-tenant)
 * @param requestingUserId - ID del usuario que solicita
 * @returns Activo encontrado con relaciones Organization y Owner cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el activo no existe o no pertenece a la organización
 */
export const getActivoById = async (
  activoId: UUID,
  organizationId: UUID,
  requestingUserId: UUID
): Promise<Activo> => {
  await assertCanAccessOrganization(requestingUserId, organizationId);
  const dependenciaId = await getDependenciaIdFromAreaId(organizationId);

  const activo = await Activo.findOne({
    where: {
      id: activoId,
      dependenciaId,
      deletedAt: null,
    } as unknown as Record<string, unknown>,
    include: [
      { model: Dependencia, as: 'Dependencia' },
      { model: PrestadorProfile, as: 'Owner' },
    ],
  });

  if (!activo) {
    throw new NotFoundError('Activo', { activoId, organizationId });
  }

  return activo;
};

/**
 * Lista activos con paginación y filtros.
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros de paginación y búsqueda
 * @param requestingUserId - ID del usuario que solicita
 * @returns Datos paginados de activos con relaciones Organization y Owner cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 */
export const listActivos = async (
  organizationId: UUID,
  filters: ListActivosDTO,
  requestingUserId: UUID
): Promise<{ data: Activo[]; pagination: PaginationMeta }> => {
  await assertCanAccessOrganization(requestingUserId, organizationId);
  const dependenciaId = await getDependenciaIdFromAreaId(organizationId);

  const where: Record<string, unknown> = {
    dependenciaId,
    deletedAt: null,
  };

  // Aplicar filtros opcionales
  if (filters.ownerId) {
    where['ownerId'] = filters.ownerId;
  }
  if (filters.type) {
    where['type'] = filters.type;
  }
  if (filters.status) {
    where['status'] = filters.status;
  }

  // Configurar paginación
  const limit = filters.limit;
  const sortBy = filters.sortBy ?? 'createdAt';
  const sortOrder = filters.sortOrder ?? 'desc';
  const offset = (filters.page - 1) * limit;

  // Ejecutar query con paginación (includes con atributos mínimos)
  const result = await Activo.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sortBy, sortOrder]],
    include: [
      {
        model: Dependencia,
        as: 'Dependencia',
        attributes: ['id', 'name'],
      },
      {
        model: PrestadorProfile,
        as: 'Owner',
        attributes: ['id', 'userId'],
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'name'],
          },
        ],
      },
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
 * Actualiza el estado de un activo con validación de transiciones.
 *
 * @param activoId - ID del activo
 * @param organizationId - ID de la organización (multi-tenant)
 * @param newStatus - Nuevo estado deseado
 * @param requestingUserId - ID del usuario que actualiza
 * @returns Activo actualizado con relaciones Organization y Owner cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el activo no existe o no pertenece a la organización
 * @throws {ValidationError} Si la transición de estado no es válida
 */
export const updateActivoStatus = async (
  activoId: UUID,
  organizationId: UUID,
  newStatus: ActivoStatus,
  requestingUserId: UUID
): Promise<Activo> => {
  await assertCanAccessOrganization(requestingUserId, organizationId);
  const dependenciaId = await getDependenciaIdFromAreaId(organizationId);

  const activo = await Activo.findOne({
    where: {
      id: activoId,
      dependenciaId,
      deletedAt: null,
    } as unknown as Record<string, unknown>,
  });

  if (!activo) {
    throw new NotFoundError('Activo', { activoId, organizationId });
  }

  // Validar transición de estado
  const previousStatus = activo.status;
  validateEstadoTransition(previousStatus, newStatus);

  // Actualizar estado
  activo.status = newStatus;
  await activo.save();

  // Cargar relaciones para retornar datos completos
  await activo.reload({
    include: [
      { model: Dependencia, as: 'Dependencia' },
      { model: PrestadorProfile, as: 'Owner' },
    ],
  });

  logger.info(
    {
      activoId: activo.id,
      organizationId,
      previousStatus,
      newStatus,
      requestingUserId,
    },
    'Estado de activo actualizado exitosamente'
  );

  return activo;
};

/**
 * Actualiza un activo (type y/o status).
 * Valida transiciones de estado cuando se actualiza status.
 *
 * @param activoId - ID del activo
 * @param organizationId - ID de la organización (multi-tenant)
 * @param data - Datos a actualizar (type y/o status)
 * @param requestingUserId - ID del usuario que actualiza
 * @returns Activo actualizado con relaciones Organization y Owner cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el activo no existe o no pertenece a la organización
 * @throws {ValidationError} Si la transición de estado no es válida
 */
export const updateActivo = async (
  activoId: UUID,
  organizationId: UUID,
  data: UpdateActivoDTO,
  requestingUserId: UUID
): Promise<Activo> => {
  await assertCanAccessOrganization(requestingUserId, organizationId);
  const dependenciaId = await getDependenciaIdFromAreaId(organizationId);

  const activo = await Activo.findOne({
    where: {
      id: activoId,
      dependenciaId,
      deletedAt: null,
    } as unknown as Record<string, unknown>,
  });

  if (!activo) {
    throw new NotFoundError('Activo', { activoId, organizationId });
  }

  // Preparar datos de actualización
  const updateData: Partial<{
    type: 'embarcacion' | 'vehiculo' | 'guia' | 'equipo';
    status: ActivoStatus;
  }> = {};

  // Actualizar type si se proporciona
  if (data.type !== undefined) {
    updateData.type = data.type;
  }

  // Actualizar status si se proporciona (con validación de transiciones)
  if (data.status !== undefined) {
    const previousStatus = activo.status;
    validateEstadoTransition(previousStatus, data.status);
    updateData.status = data.status;
  }

  // Actualizar solo los campos proporcionados
  await activo.update(updateData);

  // Cargar relaciones para retornar datos completos
  await activo.reload({
    include: [
      { model: Dependencia, as: 'Dependencia' },
      { model: PrestadorProfile, as: 'Owner' },
    ],
  });

  const updatedKeys = [
    data.type !== undefined && 'type',
    data.status !== undefined && 'status',
  ].filter(Boolean) as string[];

  logger.info(
    {
      activoId: activo.id,
      organizationId,
      updatedFields: updatedKeys,
      requestingUserId,
    },
    'Activo actualizado exitosamente'
  );

  return activo;
};

/**
 * Elimina un activo (soft delete).
 *
 * @param activoId - ID del activo
 * @param organizationId - ID de la organización (multi-tenant)
 * @param requestingUserId - ID del usuario que elimina
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el activo no existe o no pertenece a la organización
 */
export const deleteActivo = async (
  activoId: UUID,
  organizationId: UUID,
  requestingUserId: UUID
): Promise<void> => {
  await assertCanAccessOrganization(requestingUserId, organizationId);
  const dependenciaId = await getDependenciaIdFromAreaId(organizationId);

  const activo = await Activo.findOne({
    where: {
      id: activoId,
      dependenciaId,
      deletedAt: null,
    } as unknown as Record<string, unknown>,
  });

  if (!activo) {
    throw new NotFoundError('Activo', { activoId, organizationId });
  }

  // Realizar soft delete manual
  // Nota: El modelo no tiene paranoid: true, por lo que se usa soft delete manual
  // Se asume que el campo deletedAt existe en la tabla (puede requerir migración)
  await activo.update({ deletedAt: new Date() } as unknown as Partial<Activo>);

  logger.info(
    {
      activoId,
      organizationId,
      requestingUserId,
    },
    'Activo eliminado exitosamente (soft delete)'
  );
};
