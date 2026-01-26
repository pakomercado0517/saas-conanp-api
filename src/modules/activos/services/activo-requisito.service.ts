import type { UUID } from '@/shared/database/types.js';
import { ActivoRequisito } from '@/modules/activos/models/activo-requisito.model.js';
import { Activo } from '@/modules/activos/models/activo.model.js';
import type {
  CreateActivoRequisitoDTO,
  UpdateActivoRequisitoDTO,
  ListActivoRequisitosDTO,
} from '@/modules/activos/validators/activo.validator.js';
import { NotFoundError, ValidationError } from '@/shared/errors/index.js';
import type { PaginationMeta } from '@/shared/responses/types.js';
import { logger } from '@/shared/logger/index.js';
import { assertCanAccessOrganization } from '@/modules/organizations/services/organization.service.js';
import { getActivoById } from '@/modules/activos/services/activo.service.js';

/**
 * Crea un requisito de activo.
 *
 * @param data - Datos del requisito
 * @param organizationId - ID de la organización (multi-tenant)
 * @param requestingUserId - ID del usuario que crea
 * @returns ActivoRequisito creado con relación Activo cargada
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el activo no existe o no pertenece a la organización
 * @throws {ValidationError} Si ya existe un requisito con la misma clave para el activo
 */
export const createRequisito = async (
  data: CreateActivoRequisitoDTO,
  organizationId: UUID,
  requestingUserId: UUID
): Promise<ActivoRequisito> => {
  await assertCanAccessOrganization(requestingUserId, organizationId);

  await getActivoById(data.activoId, organizationId, requestingUserId);

  let requisito: ActivoRequisito;
  try {
    requisito = await ActivoRequisito.create({
      activoId: data.activoId,
      key: data.key,
      value: data.value ?? null,
      documentUrl: data.documentUrl ?? null,
      validated: data.validated ?? false,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      'name' in error &&
      error.name === 'SequelizeUniqueConstraintError'
    ) {
      throw new ValidationError(
        'Ya existe un requisito con esta clave para este activo',
        undefined,
        { activoId: data.activoId, key: data.key }
      );
    }
    throw error;
  }

  await requisito.reload({ include: [{ model: Activo, as: 'Activo' }] });

  logger.info(
    {
      requisitoId: requisito.id,
      activoId: requisito.activoId,
      key: requisito.key,
      organizationId,
      requestingUserId,
    },
    'Requisito de activo creado exitosamente'
  );

  return requisito;
};

/**
 * Lista requisitos de un activo con paginación y filtros.
 *
 * @param activoId - ID del activo
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros de paginación y búsqueda
 * @param requestingUserId - ID del usuario que solicita
 * @returns Datos paginados de requisitos con relación Activo cargada
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el activo no existe o no pertenece a la organización
 */
export const listRequisitosByActivo = async (
  activoId: UUID,
  organizationId: UUID,
  filters: ListActivoRequisitosDTO,
  requestingUserId: UUID
): Promise<{ data: ActivoRequisito[]; pagination: PaginationMeta }> => {
  await assertCanAccessOrganization(requestingUserId, organizationId);

  await getActivoById(activoId, organizationId, requestingUserId);

  const where: Record<string, unknown> = { activoId };
  if (filters.validated !== undefined) {
    where['validated'] = filters.validated;
  }

  const limit = filters.limit;
  const sortBy = filters.sortBy ?? 'key';
  const sortOrder = filters.sortOrder ?? 'asc';
  const offset = (filters.page - 1) * limit;

  const result = await ActivoRequisito.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sortBy, sortOrder]],
    include: [{ model: Activo, as: 'Activo' }],
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
 * Actualiza un requisito de activo.
 * Solo se pueden actualizar value, documentUrl y validated (no key).
 *
 * @param requisitoId - ID del requisito
 * @param organizationId - ID de la organización (multi-tenant)
 * @param data - Datos a actualizar
 * @param requestingUserId - ID del usuario que actualiza
 * @returns ActivoRequisito actualizado con relación Activo cargada
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el requisito no existe o su activo no pertenece a la organización
 */
export const updateRequisito = async (
  requisitoId: UUID,
  organizationId: UUID,
  data: UpdateActivoRequisitoDTO,
  requestingUserId: UUID
): Promise<ActivoRequisito> => {
  await assertCanAccessOrganization(requestingUserId, organizationId);

  const requisito = await ActivoRequisito.findOne({
    where: { id: requisitoId },
    include: [{ model: Activo, as: 'Activo' }],
  });

  if (!requisito || !requisito.Activo || requisito.Activo.organizationId !== organizationId) {
    throw new NotFoundError('Requisito de activo', { requisitoId, organizationId });
  }

  const updateData: Partial<{
    value: string | null;
    documentUrl: string | null;
    validated: boolean;
  }> = {};

  if (data.value !== undefined) updateData.value = data.value;
  if (data.documentUrl !== undefined) updateData.documentUrl = data.documentUrl;
  if (data.validated !== undefined) updateData.validated = data.validated;

  await requisito.update(updateData);
  await requisito.reload({ include: [{ model: Activo, as: 'Activo' }] });

  logger.info(
    {
      requisitoId: requisito.id,
      activoId: requisito.activoId,
      organizationId,
      updatedFields: Object.keys(updateData),
      requestingUserId,
    },
    'Requisito de activo actualizado exitosamente'
  );

  return requisito;
};

/**
 * Elimina un requisito de activo (hard delete).
 *
 * @param requisitoId - ID del requisito
 * @param organizationId - ID de la organización (multi-tenant)
 * @param requestingUserId - ID del usuario que elimina
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el requisito no existe o su activo no pertenece a la organización
 */
export const deleteRequisito = async (
  requisitoId: UUID,
  organizationId: UUID,
  requestingUserId: UUID
): Promise<void> => {
  await assertCanAccessOrganization(requestingUserId, organizationId);

  const requisito = await ActivoRequisito.findOne({
    where: { id: requisitoId },
    include: [{ model: Activo, as: 'Activo' }],
  });

  if (!requisito || !requisito.Activo || requisito.Activo.organizationId !== organizationId) {
    throw new NotFoundError('Requisito de activo', { requisitoId, organizationId });
  }

  await requisito.destroy();

  logger.info(
    { requisitoId, activoId: requisito.activoId, organizationId, requestingUserId },
    'Requisito de activo eliminado exitosamente'
  );
};
