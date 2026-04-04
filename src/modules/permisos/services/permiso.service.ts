import { randomUUID } from 'node:crypto';
import { Op, fn, col } from 'sequelize';
import type { UUID } from '@/shared/database/types.js';
import { sequelize } from '@/shared/database/index.js';
import { Area } from '@/modules/areas/models/area.model.js';
import { Permiso } from '@/modules/permisos/models/permiso.model.js';
import { PrestadorProfile } from '@/modules/prestadores/models/prestador-profile.model.js';
import { User } from '@/modules/users/models/user.model.js';
import { Actividad } from '@/modules/actividades/models/actividad.model.js';
import type {
  CreatePermisoDTO,
  UpdatePermisoDTO,
  ListPermisosDTO,
  ListPrestadoresConPermisosPorAreaDTO,
} from '@/modules/permisos/validators/permiso.validator.js';
import { NotFoundError, ValidationError } from '@/shared/errors/index.js';
import type { PaginationMeta } from '@/shared/responses/types.js';
import { logger } from '@/shared/logger/index.js';
import { assertCanAccessOrganization } from '@/modules/organizations/services/organization.service.js';
import { now, isWithinValidityRange, DateTime, fromJSDate } from '@/shared/dates/index.js';
import { findMatchingActividadesByDependencia } from './permiso-scope.helper.js';

/** Resuelve areaId (organizationId en API) a dependenciaId. Prestadores son por dependencia, actividades por área. */
const getDependenciaIdFromAreaId = async (areaId: UUID): Promise<UUID> => {
  const area = await Area.findByPk(areaId);
  if (!area) throw new NotFoundError('Área', { areaId });
  return area.dependenciaId;
};

/**
 * Construye el where de permisos para listados con filtros opcionales.
 * Con `soloVigentes`, fuerza permiso activo y rango de fechas en el instante actual.
 */
const buildPermisoWhereFromListFilters = (
  filters: ListPermisosDTO | ListPrestadoresConPermisosPorAreaDTO,
  options: { soloVigentes: boolean }
): Record<string, unknown> => {
  const where: Record<string, unknown> = {};
  if (filters.prestadorId) {
    where['prestadorId'] = filters.prestadorId;
  }

  if (options.soloVigentes) {
    const checkDateJS = now().toJSDate();
    where['status'] = 'activo';
    where['validFrom'] = { [Op.lte]: checkDateJS };
    where['validTo'] = { [Op.gte]: checkDateJS };
    if (filters.actividadId) {
      where['actividadId'] = filters.actividadId;
    }
    if (filters.documentUrl) {
      where['documentUrl'] = {
        [Op.iLike]: `%${filters.documentUrl}%`,
      };
    }
    return where;
  }

  if (filters.actividadId) {
    where['actividadId'] = filters.actividadId;
  }
  if (filters.status) {
    where['status'] = filters.status;
  }
  if (filters.validFrom) {
    const validFromDate =
      filters.validFrom && typeof filters.validFrom === 'object' && 'toJSDate' in filters.validFrom
        ? (filters.validFrom as DateTime).toJSDate()
        : filters.validFrom;
    where['validFrom'] = {
      [Op.gte]: validFromDate,
    };
  }
  if (filters.validTo) {
    const validToDate =
      filters.validTo && typeof filters.validTo === 'object' && 'toJSDate' in filters.validTo
        ? (filters.validTo as DateTime).toJSDate()
        : filters.validTo;
    where['validTo'] = {
      [Op.lte]: validToDate,
    };
  }
  if (filters.documentUrl) {
    where['documentUrl'] = {
      [Op.iLike]: `%${filters.documentUrl}%`,
    };
  }

  return where;
};

/**
 * Valida que las fechas de vigencia sean correctas.
 *
 * @param validFrom - Fecha de inicio
 * @param validTo - Fecha de fin
 * @throws {ValidationError} Si las fechas no son válidas
 */
export const validateFechasVigencia = (
  validFrom: DateTime | Date,
  validTo: DateTime | Date
): void => {
  const from = validFrom instanceof Date ? fromJSDate(validFrom) : validFrom;
  const to = validTo instanceof Date ? fromJSDate(validTo) : validTo;

  if (!from || !from.isValid || !to || !to.isValid) {
    throw new ValidationError('Las fechas de vigencia deben ser válidas');
  }

  if (to <= from) {
    throw new ValidationError(
      'La fecha de fin (validTo) debe ser posterior a la fecha de inicio (validFrom)',
      undefined,
      {
        validFrom: from.toISO(),
        validTo: to.toISO(),
      }
    );
  }
};

/**
 * Verifica si un permiso está vigente en una fecha específica (o fecha actual).
 *
 * @param permiso - El permiso a verificar
 * @param date - Fecha a verificar (opcional, default: fecha actual)
 * @returns true si el permiso está vigente, false en caso contrario
 */
export const isPermisoVigente = (permiso: Permiso, date?: DateTime): boolean => {
  // Verificar que el status sea activo
  if (permiso.status !== 'activo') {
    return false;
  }

  // Usar fecha actual si no se proporciona
  const checkDate = date ?? now();

  // Convertir fechas del permiso a DateTime
  const validFrom = fromJSDate(permiso.validFrom);
  const validTo = fromJSDate(permiso.validTo);

  // Verificar que la fecha esté dentro del rango de vigencia
  return isWithinValidityRange(checkDate, validFrom, validTo);
};

/**
 * Valida que un prestador tenga un permiso vigente para una actividad específica.
 * Prestador por dependencia, actividad por área; el área debe ser de la misma dependencia.
 *
 * @param prestadorId - ID del prestador
 * @param actividadId - ID de la actividad
 * @param areaId - ID del área (organizationId en API)
 * @param date - Fecha a verificar (opcional, default: fecha actual)
 * @returns Permiso vigente o null si no existe
 * @throws {ValidationError} Si el prestador o actividad no pertenecen al contexto
 */
export const validatePrestadorHasPermisoVigente = async (
  prestadorId: UUID,
  actividadId: UUID,
  areaId: UUID,
  date?: DateTime
): Promise<Permiso | null> => {
  const dependenciaId = await getDependenciaIdFromAreaId(areaId);

  const prestador = await PrestadorProfile.findOne({
    where: { id: prestadorId, dependenciaId },
  });

  if (!prestador) {
    throw new ValidationError(
      'El prestador no existe o no pertenece a esta dependencia',
      undefined,
      {
        prestadorId,
        dependenciaId,
      }
    );
  }

  const actividad = await Actividad.findOne({
    where: { id: actividadId, areaId },
  });

  if (!actividad) {
    throw new ValidationError('La actividad no existe o no pertenece a esta área', undefined, {
      actividadId,
      areaId,
    });
  }

  // Usar fecha actual si no se proporciona
  const checkDate = date ?? now();
  const checkDateJS = checkDate.toJSDate();

  // Buscar permiso vigente
  const permiso = await Permiso.findOne({
    where: {
      prestadorId,
      actividadId,
      status: 'activo',
      validFrom: {
        [Op.lte]: checkDateJS,
      },
      validTo: {
        [Op.gte]: checkDateJS,
      },
    },
    include: [
      { model: PrestadorProfile, as: 'PrestadorProfile' },
      { model: Actividad, as: 'Actividad' },
    ],
  });

  return permiso;
};

/**
 * Crea un nuevo permiso para un prestador y actividad.
 *
 * @param data - Datos del permiso
 * @param organizationId - ID de la organización (multi-tenant)
 * @param creatorUserId - ID del usuario que crea
 * @returns Permiso creado con relaciones PrestadorProfile y Actividad cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el prestador o actividad no existen
 * @throws {ValidationError} Si el prestador y actividad no pertenecen a la misma organización
 * @returns Un permiso o varios si `appliesToAllAreas` es true (materialización por área)
 */
export const createPermiso = async (
  data: CreatePermisoDTO,
  organizationId: UUID,
  creatorUserId: UUID
): Promise<Permiso | Permiso[]> => {
  await assertCanAccessOrganization(creatorUserId, organizationId);
  const dependenciaId = await getDependenciaIdFromAreaId(organizationId);

  const prestador = await PrestadorProfile.findOne({
    where: { id: data.prestadorId, dependenciaId },
  });

  if (!prestador) {
    throw new NotFoundError('Prestador', {
      prestadorId: data.prestadorId,
      dependenciaId,
    });
  }

  const actividad = await Actividad.findOne({
    where: { id: data.actividadId, areaId: organizationId },
  });

  if (!actividad) {
    throw new NotFoundError('Actividad', {
      actividadId: data.actividadId,
      areaId: organizationId,
    });
  }

  const validFromDate = data.validFrom.toJSDate();
  const validToDate = data.validTo.toJSDate();
  validateFechasVigencia(data.validFrom, data.validTo);

  const appliesToAllAreas = data.appliesToAllAreas === true;

  if (appliesToAllAreas) {
    const matched = await findMatchingActividadesByDependencia(dependenciaId, data.actividadId);

    for (const m of matched) {
      const existing = await Permiso.findOne({
        where: { prestadorId: data.prestadorId, actividadId: m.actividadId },
      });
      if (existing) {
        throw new ValidationError(
          'Ya existe un permiso para este prestador y una de las actividades del alcance',
          undefined,
          {
            prestadorId: data.prestadorId,
            actividadId: m.actividadId,
            areaId: m.areaId,
          }
        );
      }
    }

    const permissionGroupId = randomUUID();
    const status = data.status ?? 'activo';
    const documentUrl = data.documentUrl ?? null;

    let createdRows: Permiso[];
    try {
      createdRows = await sequelize.transaction(async (transaction) => {
        const rows: Permiso[] = [];
        for (const m of matched) {
          const row = await Permiso.create(
            {
              prestadorId: data.prestadorId,
              actividadId: m.actividadId,
              validFrom: validFromDate,
              validTo: validToDate,
              status,
              documentUrl,
              appliesToAllAreas: true,
              permissionGroupId,
            },
            { transaction }
          );
          rows.push(row);
        }
        return rows;
      });
    } catch (error) {
      if (
        error instanceof Error &&
        'name' in error &&
        error.name === 'SequelizeUniqueConstraintError'
      ) {
        throw new ValidationError(
          'Ya existe un permiso para este prestador y actividad',
          undefined,
          {
            prestadorId: data.prestadorId,
          }
        );
      }
      throw error;
    }

    for (const permiso of createdRows) {
      await permiso.reload({
        include: [
          { model: PrestadorProfile, as: 'PrestadorProfile' },
          { model: Actividad, as: 'Actividad' },
        ],
      });
    }

    logger.info(
      {
        count: createdRows.length,
        permissionGroupId,
        prestadorId: data.prestadorId,
        organizationId,
        creatorUserId,
      },
      'Permisos creados (alcance todas las áreas)'
    );

    return createdRows;
  }

  // Una sola área: flujo original
  let permiso: Permiso;
  try {
    permiso = await Permiso.create({
      prestadorId: data.prestadorId,
      actividadId: data.actividadId,
      validFrom: validFromDate,
      validTo: validToDate,
      status: data.status ?? 'activo',
      documentUrl: data.documentUrl ?? null,
      appliesToAllAreas: false,
      permissionGroupId: null,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      'name' in error &&
      error.name === 'SequelizeUniqueConstraintError'
    ) {
      throw new ValidationError('Ya existe un permiso para este prestador y actividad', undefined, {
        prestadorId: data.prestadorId,
        actividadId: data.actividadId,
      });
    }
    throw error;
  }

  await permiso.reload({
    include: [
      { model: PrestadorProfile, as: 'PrestadorProfile' },
      { model: Actividad, as: 'Actividad' },
    ],
  });

  logger.info(
    {
      permisoId: permiso.id,
      prestadorId: permiso.prestadorId,
      actividadId: permiso.actividadId,
      organizationId,
      status: permiso.status,
      creatorUserId,
    },
    'Permiso creado exitosamente'
  );

  return permiso;
};

/**
 * Obtiene un permiso por ID.
 *
 * @param permisoId - ID del permiso
 * @param organizationId - ID de la organización (multi-tenant)
 * @param requestingUserId - ID del usuario que solicita
 * @returns Permiso encontrado con relaciones PrestadorProfile y Actividad cargadas
 * @throws {ForbiddenError} Si no tiene acceso
 * @throws {NotFoundError} Si el permiso no existe o no pertenece a la organización
 */
export const getPermisoById = async (
  permisoId: UUID,
  organizationId: UUID,
  requestingUserId: UUID
): Promise<Permiso> => {
  await assertCanAccessOrganization(requestingUserId, organizationId);
  const dependenciaId = await getDependenciaIdFromAreaId(organizationId);

  const permiso = await Permiso.findOne({
    where: { id: permisoId },
    include: [
      {
        model: PrestadorProfile,
        as: 'PrestadorProfile',
        where: { dependenciaId },
        required: true,
      },
      { model: Actividad, as: 'Actividad' },
    ],
  });

  if (!permiso) {
    throw new NotFoundError('Permiso', { permisoId, organizationId });
  }

  if (permiso.Actividad && permiso.Actividad.areaId !== organizationId) {
    throw new NotFoundError('Permiso', { permisoId, organizationId });
  }

  return permiso;
};

/**
 * Lista permisos de un prestador específico.
 *
 * @param prestadorId - ID del prestador
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros de paginación y búsqueda
 * @param requestingUserId - ID del usuario que solicita
 * @returns Datos paginados de permisos con relaciones cargadas
 * @throws {ForbiddenError} Si no tiene acceso
 * @throws {NotFoundError} Si el prestador no existe
 */
export const listPermisosByPrestador = async (
  prestadorId: UUID,
  organizationId: UUID,
  filters: ListPermisosDTO,
  requestingUserId: UUID
): Promise<{ data: Permiso[]; pagination: PaginationMeta }> => {
  await assertCanAccessOrganization(requestingUserId, organizationId);
  const dependenciaId = await getDependenciaIdFromAreaId(organizationId);

  const prestador = await PrestadorProfile.findOne({
    where: { id: prestadorId, dependenciaId },
  });

  if (!prestador) {
    throw new NotFoundError('Prestador', { prestadorId, organizationId });
  }

  const where = buildPermisoWhereFromListFilters(
    { ...filters, prestadorId },
    { soloVigentes: false }
  );

  // Configurar paginación
  const limit = filters.limit;
  const sortBy = filters.sortBy ?? 'createdAt';
  const sortOrder = filters.sortOrder ?? 'desc';
  const offset = (filters.page - 1) * limit;

  // Ejecutar query con paginación (includes con atributos mínimos)
  const result = await Permiso.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sortBy, sortOrder]],
    include: [
      {
        model: PrestadorProfile,
        as: 'PrestadorProfile',
        where: { dependenciaId },
        required: true,
        attributes: ['id', 'userId'],
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'name'],
          },
        ],
      },
      {
        model: Actividad,
        as: 'Actividad',
        where: { areaId: organizationId },
        required: true,
        attributes: ['id', 'name'],
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

export interface PrestadorConPermisosEnArea {
  prestador: PrestadorProfile;
  permisos: Permiso[];
}

/**
 * Lista prestadores que tienen al menos un permiso en el área, con todos los permisos
 * de ese área anidados bajo cada prestador. La paginación aplica sobre prestadores distintos.
 */
export const listPrestadoresConPermisosPorArea = async (
  organizationId: UUID,
  filters: ListPrestadoresConPermisosPorAreaDTO,
  requestingUserId: UUID
): Promise<{ data: PrestadorConPermisosEnArea[]; pagination: PaginationMeta }> => {
  await assertCanAccessOrganization(requestingUserId, organizationId);
  const dependenciaId = await getDependenciaIdFromAreaId(organizationId);

  const permisoWhere = buildPermisoWhereFromListFilters(filters, {
    soloVigentes: filters.soloVigentes,
  });

  const limit = filters.limit;
  const page = filters.page;
  const offset = (page - 1) * limit;

  const actividadInclude = {
    model: Actividad,
    as: 'Actividad' as const,
    where: { areaId: organizationId },
    required: true,
  };

  const prestadorInclude = {
    model: PrestadorProfile,
    as: 'PrestadorProfile' as const,
    where: { dependenciaId },
    required: true,
    attributes: [],
  };

  const total = await Permiso.count({
    distinct: true,
    col: 'prestadorId',
    where: permisoWhere,
    include: [actividadInclude, prestadorInclude],
  });

  const totalPages = Math.ceil(total / limit);

  const groupedRows = await Permiso.findAll({
    attributes: ['prestadorId', [fn('MAX', col('Permiso.createdAt')), 'lastPermisoAt']],
    where: permisoWhere,
    include: [
      { ...actividadInclude, attributes: [] },
      { ...prestadorInclude, attributes: [] },
    ],
    group: ['Permiso.prestadorId'],
    order: [[fn('MAX', col('Permiso.createdAt')), 'DESC']],
    limit,
    offset,
    subQuery: false,
  });

  const prestadorIds = groupedRows.map((row) => row.prestadorId as UUID);

  if (prestadorIds.length === 0) {
    return {
      data: [],
      pagination: { page, limit, total, totalPages },
    };
  }

  const sortBy = filters.sortBy ?? 'createdAt';
  const sortOrder = filters.sortOrder ?? 'desc';

  const permisosRows = await Permiso.findAll({
    where: {
      ...permisoWhere,
      prestadorId: { [Op.in]: prestadorIds },
    },
    include: [
      {
        model: Actividad,
        as: 'Actividad',
        where: { areaId: organizationId },
        required: true,
      },
    ],
    order: [[sortBy, sortOrder]],
  });

  const prestadores = await PrestadorProfile.findAll({
    where: { id: { [Op.in]: prestadorIds }, dependenciaId },
    include: [{ model: User, as: 'User' }],
  });

  const prestadorById = new Map(prestadores.map((p) => [p.id, p]));
  const permisosByPrestador = new Map<UUID, Permiso[]>();
  for (const id of prestadorIds) {
    permisosByPrestador.set(id, []);
  }
  for (const permiso of permisosRows) {
    const list = permisosByPrestador.get(permiso.prestadorId);
    if (list) {
      list.push(permiso);
    }
  }

  const data: PrestadorConPermisosEnArea[] = [];
  for (const id of prestadorIds) {
    const prestador = prestadorById.get(id);
    if (!prestador) {
      continue;
    }
    data.push({
      prestador,
      permisos: permisosByPrestador.get(id) ?? [],
    });
  }

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Actualiza un permiso existente.
 *
 * @param permisoId - ID del permiso a actualizar
 * @param organizationId - ID de la organización (multi-tenant)
 * @param data - Datos a actualizar
 * @param requestingUserId - ID del usuario que actualiza
 * @returns Permiso actualizado con relaciones cargadas
 * @throws {ForbiddenError} Si no tiene acceso
 * @throws {NotFoundError} Si el permiso no existe
 */
export const updatePermiso = async (
  permisoId: UUID,
  organizationId: UUID,
  data: UpdatePermisoDTO,
  requestingUserId: UUID
): Promise<Permiso> => {
  await assertCanAccessOrganization(requestingUserId, organizationId);
  const dependenciaId = await getDependenciaIdFromAreaId(organizationId);

  const permiso = await Permiso.findOne({
    where: { id: permisoId },
    include: [
      {
        model: PrestadorProfile,
        as: 'PrestadorProfile',
        where: { dependenciaId },
        required: true,
      },
      { model: Actividad, as: 'Actividad' },
    ],
  });

  if (!permiso) {
    throw new NotFoundError('Permiso', { permisoId, organizationId });
  }

  if (permiso.Actividad && permiso.Actividad.areaId !== organizationId) {
    throw new NotFoundError('Permiso', { permisoId, organizationId });
  }

  // Preparar datos de actualización
  const updateData: Partial<{
    validFrom: Date;
    validTo: Date;
    status: 'activo' | 'inactivo' | 'vencido' | 'suspendido';
    documentUrl: string | null;
  }> = {};

  // Convertir fechas DateTime a Date si se actualizan
  // Nota: validFrom y validTo no pueden ser null en el modelo, solo se actualizan si vienen con valor
  if (data.validFrom !== undefined && data.validFrom !== null) {
    if (typeof data.validFrom === 'object' && 'toJSDate' in data.validFrom) {
      updateData.validFrom = (data.validFrom as DateTime).toJSDate();
    }
  }

  if (data.validTo !== undefined && data.validTo !== null) {
    if (typeof data.validTo === 'object' && 'toJSDate' in data.validTo) {
      updateData.validTo = (data.validTo as DateTime).toJSDate();
    }
  }

  // Validar fechas de vigencia si ambas están presentes
  if (updateData.validFrom && updateData.validTo) {
    const validFrom = fromJSDate(updateData.validFrom);
    const validTo = fromJSDate(updateData.validTo);
    validateFechasVigencia(validFrom, validTo);
  } else if (updateData.validFrom || updateData.validTo) {
    // Si solo una fecha se actualiza, validar con la fecha existente
    const existingValidFrom = updateData.validFrom
      ? fromJSDate(updateData.validFrom)
      : fromJSDate(permiso.validFrom);
    const existingValidTo = updateData.validTo
      ? fromJSDate(updateData.validTo)
      : fromJSDate(permiso.validTo);
    validateFechasVigencia(existingValidFrom, existingValidTo);
  }

  if (data.status !== undefined) {
    updateData.status = data.status;
  }
  if (data.documentUrl !== undefined) {
    updateData.documentUrl = data.documentUrl;
  }

  await permiso.update(updateData);

  // Cargar relaciones para retornar datos completos
  await permiso.reload({
    include: [
      { model: PrestadorProfile, as: 'PrestadorProfile' },
      { model: Actividad, as: 'Actividad' },
    ],
  });

  const updatedKeys = [
    data.validFrom !== undefined && 'validFrom',
    data.validTo !== undefined && 'validTo',
    data.status !== undefined && 'status',
    data.documentUrl !== undefined && 'documentUrl',
  ].filter(Boolean) as string[];

  logger.info(
    {
      permisoId: permiso.id,
      organizationId,
      updatedFields: updatedKeys,
      requestingUserId,
    },
    'Permiso actualizado exitosamente'
  );

  return permiso;
};
