import { Op } from 'sequelize';
import type { UUID } from '@/shared/database/types.js';
import { Dependencia } from '@/modules/dependencias/models/dependencia.model.js';
import { DependenciaMembership } from '@/modules/dependencias/models/dependencia-membership.model.js';
import { Area } from '@/modules/areas/models/area.model.js';
import { Membership } from '@/modules/users/models/membership.model.js';
import { User } from '@/modules/users/models/user.model.js';
import { createFreeSubscriptionForDependencia } from '@/modules/subscriptions/services/subscription.service.js';
import {
  checkAreasLimitForDependencia,
  checkDependenciasLimitForUser,
} from '@/modules/subscriptions/services/subscription-limits.service.js';
import { assertCanAccessDependencia } from '@/modules/organizations/services/organization.service.js';
import type {
  CreateDependenciaDTO,
  UpdateDependenciaDTO,
  ListDependenciasDTO,
  CreateAreaUnderDependenciaDTO,
} from '../validators/dependencia.validator.js';
import { NotFoundError } from '@/shared/errors/index.js';
import type { PaginationMeta } from '@/shared/responses/types.js';
import { logger } from '@/shared/logger/index.js';

/**
 * Crea una dependencia y asigna al usuario como owner. Crea suscripción FREE. No crea área.
 * Respeta límite FREE: 1 dependencia por usuario.
 */
export const createDependencia = async (
  data: CreateDependenciaDTO,
  userId: UUID
): Promise<Dependencia> => {
  await checkDependenciasLimitForUser(userId);

  const dependencia = await Dependencia.create({
    name: data.name,
    settings: data.settings ?? {},
  });

  await DependenciaMembership.create({
    userId,
    dependenciaId: dependencia.id,
    role: 'owner',
    status: 'activo',
  });

  await createFreeSubscriptionForDependencia(dependencia.id);

  logger.info(
    { dependenciaId: dependencia.id, userId, name: dependencia.name },
    'Dependencia creada con owner y suscripción FREE'
  );

  return dependencia;
};

/**
 * Lista dependencias a las que el usuario tiene acceso vía DependenciaMembership.
 */
export const listDependencias = async (
  filters: ListDependenciasDTO,
  userId: UUID
): Promise<{ data: Dependencia[]; pagination: PaginationMeta }> => {
  const memberships = await DependenciaMembership.findAll({
    where: { userId, status: 'activo' },
    attributes: ['dependenciaId'],
  });
  const dependenciaIds = memberships.map((m) => m.dependenciaId);

  const limit = filters.limit;
  let total = 0;
  let rows: Dependencia[] = [];

  if (dependenciaIds.length > 0) {
    const where: Record<string, unknown> = {
      id: { [Op.in]: dependenciaIds },
    };
    if (filters.name) {
      where['name'] = { [Op.iLike]: `%${filters.name}%` };
    }

    const sortBy = filters.sortBy ?? 'createdAt';
    const sortOrder = filters.sortOrder ?? 'desc';
    const offset = (filters.page - 1) * limit;

    const result = await Dependencia.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
    });
    rows = result.rows;
    total = result.count;
  }

  const totalPages = Math.ceil(total / limit) || 1;

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

/**
 * Obtiene una dependencia por ID. El usuario debe tener acceso (DependenciaMembership o área).
 */
export const getDependenciaById = async (
  dependenciaId: UUID,
  userId: UUID
): Promise<Dependencia> => {
  await assertCanAccessDependencia(userId, dependenciaId);

  const dependencia = await Dependencia.findByPk(dependenciaId);
  if (!dependencia) {
    throw new NotFoundError('Dependencia', { dependenciaId });
  }

  return dependencia;
};

/**
 * Actualiza una dependencia. El usuario debe tener acceso.
 */
export const updateDependencia = async (
  dependenciaId: UUID,
  data: UpdateDependenciaDTO,
  userId: UUID
): Promise<Dependencia> => {
  await assertCanAccessDependencia(userId, dependenciaId);

  const dependencia = await Dependencia.findByPk(dependenciaId);
  if (!dependencia) {
    throw new NotFoundError('Dependencia', { dependenciaId });
  }

  if (data.name !== undefined) dependencia.name = data.name;
  if (data.settings !== undefined) dependencia.settings = data.settings as Record<string, unknown>;
  await dependencia.save();

  logger.info({ dependenciaId, userId, updated: Object.keys(data) }, 'Dependencia actualizada');

  return dependencia;
};

/**
 * Soft delete de una dependencia. El usuario debe tener acceso.
 */
export const deleteDependencia = async (dependenciaId: UUID, userId: UUID): Promise<void> => {
  await assertCanAccessDependencia(userId, dependenciaId);

  const dependencia = await Dependencia.findByPk(dependenciaId);
  if (!dependencia) {
    throw new NotFoundError('Dependencia', { dependenciaId });
  }

  await dependencia.destroy();
  logger.info({ dependenciaId, userId }, 'Dependencia eliminada (soft delete)');
};

/**
 * Crea un área bajo una dependencia. El usuario debe tener acceso a la dependencia.
 * Plan FREE = 1 área por dependencia; se verifica antes de crear.
 */
export const createAreaUnderDependencia = async (
  dependenciaId: UUID,
  data: CreateAreaUnderDependenciaDTO,
  userId: UUID
): Promise<Area> => {
  await assertCanAccessDependencia(userId, dependenciaId);
  await checkAreasLimitForDependencia(dependenciaId);

  const dependencia = await Dependencia.findByPk(dependenciaId);
  if (!dependencia) {
    throw new NotFoundError('Dependencia', { dependenciaId });
  }

  const area = await Area.create({
    dependenciaId,
    name: data.name,
    ecosystem_type: data.ecosystem_type,
    settings: data.settings ?? {},
  });

  // Garantiza acceso inmediato al área recién creada para el creador.
  await Membership.findOrCreate({
    where: {
      userId,
      areaId: area.id,
    },
    defaults: {
      userId,
      areaId: area.id,
      role: 'admin',
      status: 'activo',
    },
  });

  await User.update(
    { onboardingStatus: 'completed' },
    {
      where: {
        id: userId,
        onboardingStatus: 'pending_setup',
      },
    }
  );

  logger.info(
    { areaId: area.id, dependenciaId, name: area.name, userId },
    'Área creada bajo dependencia'
  );

  return area;
};

/**
 * Lista áreas de una dependencia. El usuario debe tener acceso a la dependencia.
 */
export const listAreasByDependencia = async (
  dependenciaId: UUID,
  userId: UUID
): Promise<Area[]> => {
  await assertCanAccessDependencia(userId, dependenciaId);

  return Area.findAll({
    where: { dependenciaId },
    order: [['name', 'ASC']],
  });
};
