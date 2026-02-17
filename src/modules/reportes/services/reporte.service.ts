import { Op } from 'sequelize';
import type { UUID } from '@/shared/database/types.js';
import { sequelize } from '@/shared/database/index.js';
import { EventoOperativo } from '@/modules/eventos/models/evento-operativo.model.js';
import { Actividad } from '@/modules/actividades/models/actividad.model.js';
import { PrestadorProfile } from '@/modules/prestadores/models/prestador-profile.model.js';
import { User } from '@/modules/users/models/user.model.js';
import { Capacidad } from '@/modules/actividades/models/capacidad.model.js';
import { Bloque } from '@/modules/actividades/models/bloque.model.js';
import { Permiso } from '@/modules/permisos/models/permiso.model.js';
import { StockAcceso } from '@/modules/productos-acceso/models/stock-acceso.model.js';
import { ProductoAcceso } from '@/modules/productos-acceso/models/producto-acceso.model.js';
import { MovimientoStockAcceso } from '@/modules/productos-acceso/models/movimiento-stock-acceso.model.js';
import type {
  ReporteEventosPorActividadDTO,
  ReporteEventosPorPrestadorDTO,
  ReporteEventosPorFechaDTO,
  ReporteCapacidadUtilizadaDTO,
  ReportePrestadoresActivosDTO,
  ReporteStockActualDTO,
  ReporteSalidasStockDTO,
  ReporteVentasPrestadoresDTO,
  ReporteVentasPorProductoDTO,
} from '@/modules/reportes/validators/reporte.validator.js';
import type {
  ReporteEventosPorActividadItem,
  ReporteEventosPorPrestadorItem,
  ReporteEventosPorFechaItem,
  ReporteCapacidadUtilizadaItem,
  ReportePrestadoresActivosItem,
  ReporteStockActualItem,
  ReporteSalidasStockItem,
  ReporteVentasPrestadoresItem,
  ReporteVentasPorProductoItem,
} from '@/modules/reportes/types/reporte.types.js';
import { assertCanAccessOrganization } from '@/modules/organizations/services/organization.service.js';
import { toDateOnlyDB, DateTime } from '@/shared/dates/index.js';
import { ValidationError } from '@/shared/errors/index.js';

// Límites para evitar respuestas muy grandes
const MAX_DATE_RANGE_DAYS = 365; // Máximo 1 año de rango
const MAX_RESULTS_LIMIT = 1000; // Máximo 1000 registros por reporte

/**
 * Valida que el rango de fechas no exceda el límite máximo
 */
const validateDateRange = (dateFrom?: string | DateTime, dateTo?: string | DateTime): void => {
  if (!dateFrom || !dateTo) return;

  const from = typeof dateFrom === 'string' ? DateTime.fromISO(dateFrom) : dateFrom;
  const to = typeof dateTo === 'string' ? DateTime.fromISO(dateTo) : dateTo;

  const daysDiff = to.diff(from, 'days').days;

  if (daysDiff > MAX_DATE_RANGE_DAYS) {
    throw new ValidationError(
      `El rango de fechas no puede exceder ${MAX_DATE_RANGE_DAYS} días (aproximadamente 1 año). Rango actual: ${Math.round(daysDiff)} días.`,
      'dateRange'
    );
  }
};

/**
 * Obtiene reporte de eventos agrupados por actividad
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros opcionales (actividadId, dateFrom, dateTo, status)
 * @param userId - ID del usuario que solicita
 * @returns Array con datos agrupados por actividad
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {ValidationError} Si el rango de fechas excede el máximo
 */
export const getReporteEventosPorActividad = async (
  organizationId: UUID,
  filters: ReporteEventosPorActividadDTO,
  userId: UUID
): Promise<ReporteEventosPorActividadItem[]> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(userId, organizationId);

  // Validar rango de fechas
  validateDateRange(filters.dateFrom, filters.dateTo);

  // Construir filtros base
  const whereClause: Record<string, unknown> = {
    organizationId,
    deletedAt: null,
  } as unknown as Record<string, unknown>;

  // Aplicar filtros opcionales
  if (filters.actividadId) {
    whereClause['actividadId'] = filters.actividadId;
  }

  if (filters.status) {
    whereClause['status'] = filters.status;
  }

  // Manejar filtros de fecha
  if (filters.dateFrom || filters.dateTo) {
    const dateFromStr = filters.dateFrom
      ? typeof filters.dateFrom === 'object' && 'toFormat' in filters.dateFrom
        ? toDateOnlyDB(filters.dateFrom as DateTime)
        : (filters.dateFrom as string)
      : undefined;

    const dateToStr = filters.dateTo
      ? typeof filters.dateTo === 'object' && 'toFormat' in filters.dateTo
        ? toDateOnlyDB(filters.dateTo as DateTime)
        : (filters.dateTo as string)
      : undefined;

    if (dateFromStr && dateToStr) {
      whereClause['date'] = {
        [Op.between]: [dateFromStr, dateToStr],
      };
    } else if (dateFromStr) {
      whereClause['date'] = {
        [Op.gte]: dateFromStr,
      };
    } else if (dateToStr) {
      whereClause['date'] = {
        [Op.lte]: dateToStr,
      };
    }
  }

  // Usar GROUP BY en SQL para agregaciones - mucho más eficiente
  type AggregateRow = {
    actividadId: UUID;
    totalEventos: string;
    totalPersonas: string;
    fechaInicio: string;
    fechaFin: string;
  };

  const aggregates = (await EventoOperativo.findAll({
    where: whereClause,
    attributes: [
      'actividadId',
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalEventos'],
      [sequelize.fn('SUM', sequelize.col('peopleCount')), 'totalPersonas'],
      [sequelize.fn('MIN', sequelize.col('date')), 'fechaInicio'],
      [sequelize.fn('MAX', sequelize.col('date')), 'fechaFin'],
    ],
    group: ['actividadId'],
    raw: true,
    limit: MAX_RESULTS_LIMIT,
  })) as unknown as AggregateRow[];

  if (aggregates.length === 0) {
    return [];
  }

  // Obtener nombres de actividades
  const actividadIds = aggregates.map((a) => a.actividadId);
  const actividades = await Actividad.findAll({
    where: { id: { [Op.in]: actividadIds } },
    attributes: ['id', 'name'],
  });
  const actividadMap = new Map(actividades.map((a) => [a.id, a.name]));

  // Contar eventos por status usando GROUP BY
  type StatusCountRow = {
    actividadId: UUID;
    status: string;
    count: string;
  };

  const statusCounts = (await EventoOperativo.findAll({
    where: whereClause,
    attributes: ['actividadId', 'status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['actividadId', 'status'],
    raw: true,
  })) as unknown as StatusCountRow[];

  // Mapear conteos por status
  const statusMap = new Map<
    UUID,
    { programado: number; en_curso: number; completado: number; cancelado: number }
  >();
  for (const row of statusCounts) {
    if (!statusMap.has(row.actividadId)) {
      statusMap.set(row.actividadId, { programado: 0, en_curso: 0, completado: 0, cancelado: 0 });
    }
    const counts = statusMap.get(row.actividadId)!;
    counts[row.status as keyof typeof counts] = Number(row.count);
  }

  // Construir resultado
  return aggregates.map((agg) => ({
    actividadId: agg.actividadId,
    actividadName: actividadMap.get(agg.actividadId) || 'Desconocida',
    totalEventos: Number(agg.totalEventos),
    totalPersonas: Number(agg.totalPersonas),
    eventosPorStatus:
      statusMap.get(agg.actividadId) ||
      ({ programado: 0, en_curso: 0, completado: 0, cancelado: 0 } as const),
    fechaInicio: agg.fechaInicio,
    fechaFin: agg.fechaFin,
  }));
};

/**
 * Obtiene reporte de eventos agrupados por prestador
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros opcionales (prestadorId, dateFrom, dateTo, status)
 * @param userId - ID del usuario que solicita
 * @returns Array con datos agrupados por prestador
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {ValidationError} Si el rango de fechas excede el máximo
 */
export const getReporteEventosPorPrestador = async (
  organizationId: UUID,
  filters: ReporteEventosPorPrestadorDTO,
  userId: UUID
): Promise<ReporteEventosPorPrestadorItem[]> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(userId, organizationId);

  // Validar rango de fechas
  validateDateRange(filters.dateFrom, filters.dateTo);

  // Construir filtros base
  const whereClause: Record<string, unknown> = {
    organizationId,
    deletedAt: null,
  } as unknown as Record<string, unknown>;

  // Aplicar filtros opcionales
  if (filters.prestadorId) {
    whereClause['prestadorId'] = filters.prestadorId;
  }

  if (filters.status) {
    whereClause['status'] = filters.status;
  }

  // Manejar filtros de fecha
  if (filters.dateFrom || filters.dateTo) {
    const dateFromStr = filters.dateFrom
      ? typeof filters.dateFrom === 'object' && 'toFormat' in filters.dateFrom
        ? toDateOnlyDB(filters.dateFrom as DateTime)
        : (filters.dateFrom as string)
      : undefined;

    const dateToStr = filters.dateTo
      ? typeof filters.dateTo === 'object' && 'toFormat' in filters.dateTo
        ? toDateOnlyDB(filters.dateTo as DateTime)
        : (filters.dateTo as string)
      : undefined;

    if (dateFromStr && dateToStr) {
      whereClause['date'] = {
        [Op.between]: [dateFromStr, dateToStr],
      };
    } else if (dateFromStr) {
      whereClause['date'] = {
        [Op.gte]: dateFromStr,
      };
    } else if (dateToStr) {
      whereClause['date'] = {
        [Op.lte]: dateToStr,
      };
    }
  }

  // Agregaciones por prestador usando GROUP BY en SQL
  type AggregateRow = {
    prestadorId: UUID;
    totalEventos: string;
    totalPersonas: string;
    fechaInicio: string;
    fechaFin: string;
  };

  const aggregates = (await EventoOperativo.findAll({
    where: whereClause,
    attributes: [
      'prestadorId',
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalEventos'],
      [sequelize.fn('SUM', sequelize.col('peopleCount')), 'totalPersonas'],
      [sequelize.fn('MIN', sequelize.col('date')), 'fechaInicio'],
      [sequelize.fn('MAX', sequelize.col('date')), 'fechaFin'],
    ],
    group: ['prestadorId'],
    raw: true,
    limit: MAX_RESULTS_LIMIT,
  })) as unknown as AggregateRow[];

  if (aggregates.length === 0) {
    return [];
  }

  const prestadorIds = aggregates.map((a) => a.prestadorId);

  // Obtener información de prestadores
  const prestadores = await PrestadorProfile.findAll({
    where: { id: { [Op.in]: prestadorIds } },
    include: [
      {
        model: User,
        as: 'User',
        required: true,
        attributes: ['id', 'name'],
      },
    ],
    attributes: ['id'],
  });
  const prestadorMap = new Map(prestadores.map((p) => [p.id, p.User?.name || 'Desconocido']));

  // Contar eventos por status usando GROUP BY
  type StatusCountRow = {
    prestadorId: UUID;
    status: string;
    count: string;
  };

  const statusCounts = (await EventoOperativo.findAll({
    where: whereClause,
    attributes: ['prestadorId', 'status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['prestadorId', 'status'],
    raw: true,
  })) as unknown as StatusCountRow[];

  const statusMap = new Map<
    UUID,
    { programado: number; en_curso: number; completado: number; cancelado: number }
  >();
  for (const row of statusCounts) {
    if (!statusMap.has(row.prestadorId)) {
      statusMap.set(row.prestadorId, { programado: 0, en_curso: 0, completado: 0, cancelado: 0 });
    }
    const counts = statusMap.get(row.prestadorId)!;
    counts[row.status as keyof typeof counts] = Number(row.count);
  }

  // Contar actividades distintas por prestador usando GROUP BY
  type ActividadCountRow = {
    prestadorId: UUID;
    actividadId: UUID;
    actividadName: string;
    totalEventos: string;
  };

  const actividadCounts = (await EventoOperativo.findAll({
    where: whereClause,
    attributes: [
      'prestadorId',
      'actividadId',
      [sequelize.fn('COUNT', sequelize.col('EventoOperativo.id')), 'totalEventos'],
    ],
    include: [
      {
        model: Actividad,
        as: 'Actividad',
        required: true,
        attributes: ['name'],
      },
    ],
    group: ['prestadorId', 'actividadId', 'Actividad.id'],
    raw: true,
    nest: true,
  })) as unknown as ActividadCountRow[];

  const actividadesMap = new Map<
    UUID,
    Array<{
      actividadId: UUID;
      actividadName: string;
      totalEventos: number;
    }>
  >();

  for (const row of actividadCounts) {
    if (!actividadesMap.has(row.prestadorId)) {
      actividadesMap.set(row.prestadorId, []);
    }
    actividadesMap.get(row.prestadorId)!.push({
      actividadId: row.actividadId,
      actividadName: (row as unknown as { Actividad: { name: string } }).Actividad.name,
      totalEventos: Number(row.totalEventos),
    });
  }

  // Construir resultado
  return aggregates.map((agg) => ({
    prestadorId: agg.prestadorId,
    prestadorName: prestadorMap.get(agg.prestadorId) || 'Desconocido',
    totalEventos: Number(agg.totalEventos),
    totalPersonas: Number(agg.totalPersonas),
    eventosPorStatus:
      statusMap.get(agg.prestadorId) ||
      ({ programado: 0, en_curso: 0, completado: 0, cancelado: 0 } as const),
    actividadesRealizadas: actividadesMap.get(agg.prestadorId) || [],
    fechaInicio: agg.fechaInicio,
    fechaFin: agg.fechaFin,
  }));
};

/**
 * Obtiene reporte de eventos agrupados por fecha
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros (dateFrom o dateTo requeridos, actividadId opcional, prestadorId opcional)
 * @param userId - ID del usuario que solicita
 * @returns Array con datos agrupados por fecha
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {ValidationError} Si no se proporciona dateFrom o dateTo o rango excede máximo
 */
export const getReporteEventosPorFecha = async (
  organizationId: UUID,
  filters: ReporteEventosPorFechaDTO,
  userId: UUID
): Promise<ReporteEventosPorFechaItem[]> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(userId, organizationId);

  // Validar que al menos una fecha esté presente
  if (!filters.dateFrom && !filters.dateTo) {
    throw new ValidationError('Debe proporcionar al menos una fecha (dateFrom o dateTo)');
  }

  // Validar rango de fechas
  validateDateRange(filters.dateFrom, filters.dateTo);

  // Construir filtros base
  const whereClause: Record<string, unknown> = {
    organizationId,
    deletedAt: null,
  } as unknown as Record<string, unknown>;

  // Aplicar filtros opcionales
  if (filters.actividadId) {
    whereClause['actividadId'] = filters.actividadId;
  }

  if (filters.prestadorId) {
    whereClause['prestadorId'] = filters.prestadorId;
  }

  // Manejar filtros de fecha
  const dateFromStr = filters.dateFrom
    ? typeof filters.dateFrom === 'object' && 'toFormat' in filters.dateFrom
      ? toDateOnlyDB(filters.dateFrom as DateTime)
      : (filters.dateFrom as string)
    : undefined;

  const dateToStr = filters.dateTo
    ? typeof filters.dateTo === 'object' && 'toFormat' in filters.dateTo
      ? toDateOnlyDB(filters.dateTo as DateTime)
      : (filters.dateTo as string)
    : undefined;

  if (dateFromStr && dateToStr) {
    whereClause['date'] = {
      [Op.between]: [dateFromStr, dateToStr],
    };
  } else if (dateFromStr) {
    whereClause['date'] = {
      [Op.gte]: dateFromStr,
    };
  } else if (dateToStr) {
    whereClause['date'] = {
      [Op.lte]: dateToStr,
    };
  }

  // Agregaciones por fecha usando GROUP BY en SQL
  type AggregateRow = {
    date: string;
    totalEventos: string;
    totalPersonas: string;
  };

  const aggregates = (await EventoOperativo.findAll({
    where: whereClause,
    attributes: [
      'date',
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalEventos'],
      [sequelize.fn('SUM', sequelize.col('peopleCount')), 'totalPersonas'],
    ],
    group: ['date'],
    order: [['date', 'ASC']],
    raw: true,
    limit: MAX_RESULTS_LIMIT,
  })) as unknown as AggregateRow[];

  if (aggregates.length === 0) {
    return [];
  }

  // Contar eventos por status usando GROUP BY
  type StatusCountRow = {
    date: string;
    status: string;
    count: string;
  };

  const statusCounts = (await EventoOperativo.findAll({
    where: whereClause,
    attributes: ['date', 'status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['date', 'status'],
    raw: true,
  })) as unknown as StatusCountRow[];

  const statusMap = new Map<
    string,
    { programado: number; en_curso: number; completado: number; cancelado: number }
  >();
  for (const row of statusCounts) {
    if (!statusMap.has(row.date)) {
      statusMap.set(row.date, { programado: 0, en_curso: 0, completado: 0, cancelado: 0 });
    }
    const counts = statusMap.get(row.date)!;
    counts[row.status as keyof typeof counts] = Number(row.count);
  }

  // Contar por actividad por fecha usando GROUP BY
  type ActividadCountRow = {
    date: string;
    actividadId: UUID;
    totalEventos: string;
    totalPersonas: string;
  };

  const actividadCounts = (await EventoOperativo.findAll({
    where: whereClause,
    attributes: [
      'date',
      'actividadId',
      [sequelize.fn('COUNT', sequelize.col('EventoOperativo.id')), 'totalEventos'],
      [sequelize.fn('SUM', sequelize.col('peopleCount')), 'totalPersonas'],
    ],
    include: [
      {
        model: Actividad,
        as: 'Actividad',
        required: true,
        attributes: ['name'],
      },
    ],
    group: ['date', 'actividadId', 'Actividad.id'],
    raw: true,
    nest: true,
  })) as unknown as ActividadCountRow[];

  const actividadesMap = new Map<
    string,
    Array<{ actividadId: UUID; actividadName: string; totalEventos: number; totalPersonas: number }>
  >();

  for (const row of actividadCounts) {
    if (!actividadesMap.has(row.date)) {
      actividadesMap.set(row.date, []);
    }
    actividadesMap.get(row.date)!.push({
      actividadId: row.actividadId,
      actividadName: (row as unknown as { Actividad: { name: string } }).Actividad.name,
      totalEventos: Number(row.totalEventos),
      totalPersonas: Number(row.totalPersonas),
    });
  }

  // Construir resultado
  return aggregates.map((agg) => ({
    date: agg.date,
    totalEventos: Number(agg.totalEventos),
    totalPersonas: Number(agg.totalPersonas),
    eventosPorStatus:
      statusMap.get(agg.date) ||
      ({ programado: 0, en_curso: 0, completado: 0, cancelado: 0 } as const),
    eventosPorActividad: actividadesMap.get(agg.date) || [],
  }));
};

/**
 * Obtiene reporte de capacidad utilizada
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros opcionales (actividadId, dateFrom, dateTo)
 * @param userId - ID del usuario que solicita
 * @returns Array con datos de capacidad utilizada
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {ValidationError} Si el rango de fechas excede el máximo
 */
export const getReporteCapacidadUtilizada = async (
  organizationId: UUID,
  filters: ReporteCapacidadUtilizadaDTO,
  userId: UUID
): Promise<ReporteCapacidadUtilizadaItem[]> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(userId, organizationId);

  // Validar rango de fechas
  validateDateRange(filters.dateFrom, filters.dateTo);

  // Construir filtros para capacidades
  const capacidadWhere: Record<string, unknown> = {
    organizationId,
  };

  if (filters.actividadId) {
    capacidadWhere['actividadId'] = filters.actividadId;
  }

  // Manejar filtros de fecha
  if (filters.dateFrom || filters.dateTo) {
    const dateFromStr = filters.dateFrom
      ? typeof filters.dateFrom === 'object' && 'toFormat' in filters.dateFrom
        ? toDateOnlyDB(filters.dateFrom as DateTime)
        : (filters.dateFrom as string)
      : undefined;

    const dateToStr = filters.dateTo
      ? typeof filters.dateTo === 'object' && 'toFormat' in filters.dateTo
        ? toDateOnlyDB(filters.dateTo as DateTime)
        : (filters.dateTo as string)
      : undefined;

    if (dateFromStr && dateToStr) {
      capacidadWhere['date'] = {
        [Op.between]: [dateFromStr, dateToStr],
      };
    } else if (dateFromStr) {
      capacidadWhere['date'] = {
        [Op.gte]: dateFromStr,
      };
    } else if (dateToStr) {
      capacidadWhere['date'] = {
        [Op.lte]: dateToStr,
      };
    }
  }

  // Obtener capacidades con relación a Actividad (solo atributos necesarios)
  const capacidades = await Capacidad.findAll({
    where: capacidadWhere,
    attributes: ['id', 'actividadId', 'date', 'limit'],
    include: [
      {
        model: Actividad,
        as: 'Actividad',
        required: true,
        attributes: ['id', 'name', 'agendaType'],
      },
    ],
    limit: MAX_RESULTS_LIMIT,
  });

  if (capacidades.length === 0) {
    return [];
  }

  const actividadIds = [...new Set(capacidades.map((c) => c.actividadId))];
  const allDates = [...new Set(capacidades.map((c) => c.date))];

  // Una sola query: sum(peopleCount) agrupado por actividadId, date, bloqueId
  const sumsRows = await EventoOperativo.findAll({
    where: {
      organizationId,
      status: { [Op.in]: ['programado', 'en_curso'] },
      actividadId: { [Op.in]: actividadIds },
      date: { [Op.in]: allDates },
    },
    attributes: [
      'actividadId',
      'date',
      'bloqueId',
      [sequelize.fn('SUM', sequelize.col('peopleCount')), 'total'],
    ],
    group: ['actividadId', 'date', 'bloqueId'],
    raw: true,
  });

  type SumRow = { actividadId: UUID; date: string; bloqueId: UUID | null; total: unknown };
  const sumByKey = new Map<string, number>();
  for (const row of sumsRows as unknown as SumRow[]) {
    const key = `${row.actividadId}|${row.date}|${row.bloqueId ?? 'null'}`;
    sumByKey.set(key, Number(row.total));
  }

  // Una sola query: todos los bloques de las actividades involucradas
  const actividadesConBloques = capacidades.some((c) => c.Actividad?.agendaType === 'BLOQUES');
  const bloquesPorActividad = new Map<UUID, Bloque[]>();
  if (actividadesConBloques) {
    const bloques = await Bloque.findAll({
      where: {
        actividadId: { [Op.in]: actividadIds },
        organizationId,
      },
      attributes: ['id', 'actividadId', 'capacity', 'startTime', 'endTime'],
    });
    for (const b of bloques) {
      const list = bloquesPorActividad.get(b.actividadId) ?? [];
      list.push(b);
      bloquesPorActividad.set(b.actividadId, list);
    }
  }

  const resultados: ReporteCapacidadUtilizadaItem[] = [];

  for (const capacidad of capacidades) {
    const actividad = capacidad.Actividad;
    if (!actividad) continue;

    if (actividad.agendaType === 'HORARIO_LIBRE') {
      const key = `${capacidad.actividadId}|${capacidad.date}|null`;
      const capacidadUsada = sumByKey.get(key) ?? 0;
      const capacidadDisponible = Math.max(0, capacidad.limit - capacidadUsada);
      const porcentajeUtilizado =
        capacidad.limit > 0 ? (capacidadUsada / capacidad.limit) * 100 : 0;

      resultados.push({
        actividadId: capacidad.actividadId,
        actividadName: actividad.name,
        agendaType: actividad.agendaType,
        date: capacidad.date,
        capacidadTotal: capacidad.limit,
        capacidadUsada,
        capacidadDisponible,
        porcentajeUtilizado: Math.round(porcentajeUtilizado * 100) / 100,
        bloqueId: null,
        bloqueName: null,
      });
    } else if (actividad.agendaType === 'BLOQUES') {
      const bloques = bloquesPorActividad.get(actividad.id) ?? [];
      for (const bloque of bloques) {
        const key = `${capacidad.actividadId}|${capacidad.date}|${bloque.id}`;
        const capacidadUsadaBloque = sumByKey.get(key) ?? 0;
        const capacidadTotalBloque = capacidad.limit || bloque.capacity;
        const capacidadDisponibleBloque = Math.max(0, capacidadTotalBloque - capacidadUsadaBloque);
        const porcentajeUtilizadoBloque =
          capacidadTotalBloque > 0 ? (capacidadUsadaBloque / capacidadTotalBloque) * 100 : 0;

        resultados.push({
          actividadId: capacidad.actividadId,
          actividadName: actividad.name,
          agendaType: actividad.agendaType,
          date: capacidad.date,
          capacidadTotal: capacidadTotalBloque,
          capacidadUsada: capacidadUsadaBloque,
          capacidadDisponible: capacidadDisponibleBloque,
          porcentajeUtilizado: Math.round(porcentajeUtilizadoBloque * 100) / 100,
          bloqueId: bloque.id,
          bloqueName: `${bloque.startTime} - ${bloque.endTime}`,
        });
      }
    }
  }

  return resultados;
};

/**
 * Obtiene reporte de prestadores activos
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros opcionales (status, conPermisosVigentes)
 * @param userId - ID del usuario que solicita
 * @returns Array con datos de prestadores activos
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 */
export const getReportePrestadoresActivos = async (
  organizationId: UUID,
  filters: ReportePrestadoresActivosDTO,
  userId: UUID
): Promise<ReportePrestadoresActivosItem[]> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(userId, organizationId);

  // Construir filtros para prestadores
  const prestadorWhere: Record<string, unknown> = {
    organizationId,
  };

  if (filters.status) {
    prestadorWhere['status'] = filters.status;
  }

  // Si se requiere filtrar por prestadores con permisos vigentes, obtener primero los prestadores que tienen permisos vigentes
  if (filters.conPermisosVigentes) {
    const ahora = DateTime.now().setZone('America/Mexico_City');

    // Obtener prestadores de la organización
    const prestadoresOrg = await PrestadorProfile.findAll({
      where: {
        organizationId,
        ...(filters.status ? { status: filters.status } : {}),
      },
      attributes: ['id'],
    });

    const prestadoresIds = prestadoresOrg.map((p) => p.id);

    if (prestadoresIds.length === 0) {
      return [];
    }

    // Obtener prestadores que tienen permisos vigentes
    const permisosVigentes = await Permiso.findAll({
      where: {
        prestadorId: {
          [Op.in]: prestadoresIds,
        },
        status: 'activo',
        validFrom: {
          [Op.lte]: ahora.toJSDate(),
        },
        validTo: {
          [Op.gte]: ahora.toJSDate(),
        },
      },
      attributes: ['prestadorId'],
    });

    // Extraer prestadorIds únicos
    const prestadoresIdsConPermisosVigentesSet = new Set<UUID>();
    for (const permiso of permisosVigentes) {
      prestadoresIdsConPermisosVigentesSet.add(permiso.prestadorId);
    }
    const prestadoresIdsConPermisosVigentes = Array.from(prestadoresIdsConPermisosVigentesSet);

    // Si no hay prestadores con permisos vigentes, retornar array vacío
    if (prestadoresIdsConPermisosVigentes.length === 0) {
      return [];
    }

    // Agregar filtro de prestadores con permisos vigentes
    prestadorWhere['id'] = {
      [Op.in]: prestadoresIdsConPermisosVigentes,
    };
  }

  // Obtener prestadores con relación a User (solo atributos necesarios)
  const prestadores = await PrestadorProfile.findAll({
    where: prestadorWhere,
    attributes: ['id', 'userId', 'status', 'permitExpiresAt'],
    include: [
      {
        model: User,
        as: 'User',
        required: true,
        attributes: ['id', 'name'],
      },
    ],
    limit: MAX_RESULTS_LIMIT,
  });

  if (prestadores.length === 0) {
    return [];
  }

  const prestadorIds = prestadores.map((p) => p.id);
  const ahora = DateTime.now().setZone('America/Mexico_City');

  // Una sola query: todos los eventos de estos prestadores
  const eventos = await EventoOperativo.findAll({
    where: {
      prestadorId: { [Op.in]: prestadorIds },
      organizationId,
      deletedAt: null,
    } as unknown as Record<string, unknown>,
    attributes: ['prestadorId', 'date', 'peopleCount'],
    order: [['date', 'DESC']],
  });

  // Agrupar por prestador: totalEventos, totalPersonas, ultimoEvento
  const eventosPorPrestador = new Map<
    UUID,
    { totalEventos: number; totalPersonas: number; ultimoEvento: string | null }
  >();
  for (const id of prestadorIds) {
    eventosPorPrestador.set(id, {
      totalEventos: 0,
      totalPersonas: 0,
      ultimoEvento: null,
    });
  }
  for (const evento of eventos) {
    const agg = eventosPorPrestador.get(evento.prestadorId)!;
    agg.totalEventos += 1;
    agg.totalPersonas += evento.peopleCount ?? 0;
    if (!agg.ultimoEvento) agg.ultimoEvento = evento.date;
  }

  // Una sola query: conteo de permisos por prestador (GROUP BY)
  const permisoWhere: Record<string, unknown> = {
    prestadorId: { [Op.in]: prestadorIds },
    status: 'activo',
  };
  if (filters.conPermisosVigentes) {
    permisoWhere['validFrom'] = { [Op.lte]: ahora.toJSDate() };
    permisoWhere['validTo'] = { [Op.gte]: ahora.toJSDate() };
  }
  const permisosCountRows = await Permiso.findAll({
    where: permisoWhere,
    attributes: ['prestadorId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['prestadorId'],
    raw: true,
  });
  type PermisoCountRow = { prestadorId: UUID; count: unknown };
  const permisosPorPrestador = new Map<UUID, number>();
  for (const row of permisosCountRows as unknown as PermisoCountRow[]) {
    permisosPorPrestador.set(row.prestadorId, Number(row.count));
  }

  const resultados: ReportePrestadoresActivosItem[] = prestadores.map((prestador) => {
    const user = prestador.User!;
    const agg = eventosPorPrestador.get(prestador.id)!;
    const actividadesPermitidas = permisosPorPrestador.get(prestador.id) ?? 0;
    return {
      prestadorId: prestador.id,
      prestadorName: user.name,
      status: prestador.status,
      permitExpiresAt: prestador.permitExpiresAt,
      totalEventos: agg.totalEventos,
      totalPersonas: agg.totalPersonas,
      actividadesPermitidas,
      ultimoEvento: agg.ultimoEvento,
    };
  });

  return resultados.sort((a, b) => a.prestadorName.localeCompare(b.prestadorName));
};

// --- Reportes de stock y ventas (brazaletes/pasaportes) ---

const toDateStr = (val: string | DateTime | undefined): string | undefined => {
  if (!val) return undefined;
  if (typeof val === 'string') return val;
  return 'toFormat' in val ? (val as DateTime).toFormat('yyyy-MM-dd') : undefined;
};

/**
 * Reporte de stock actual por producto (por organización).
 */
export const getReporteStockActual = async (
  organizationId: UUID,
  _filters: ReporteStockActualDTO,
  userId: UUID
): Promise<ReporteStockActualItem[]> => {
  await assertCanAccessOrganization(userId, organizationId);

  const stocks = await StockAcceso.findAll({
    where: { organizationId },
    include: [
      {
        model: ProductoAcceso,
        as: 'ProductoAcceso',
        required: true,
        attributes: ['id', 'name', 'tipo', 'vigenciaDias'],
      },
    ],
  });

  return stocks.map((s) => ({
    productoAccesoId: s.productoAccesoId,
    productName: (s as StockAcceso & { ProductoAcceso: ProductoAcceso }).ProductoAcceso.name,
    tipo: (s as StockAcceso & { ProductoAcceso: ProductoAcceso }).ProductoAcceso.tipo,
    vigenciaDias: (s as StockAcceso & { ProductoAcceso: ProductoAcceso }).ProductoAcceso
      .vigenciaDias,
    cantidad: s.cantidad,
  }));
};

/**
 * Reporte de salidas de stock por período (cantidad y montos totales).
 */
export const getReporteSalidasPorPeriodo = async (
  organizationId: UUID,
  filters: ReporteSalidasStockDTO,
  userId: UUID
): Promise<ReporteSalidasStockItem> => {
  await assertCanAccessOrganization(userId, organizationId);
  validateDateRange(filters.dateFrom, filters.dateTo);

  const dateFromStr = toDateStr(filters.dateFrom);
  const dateToStr = toDateStr(filters.dateTo);

  const where: Record<string, unknown> = {
    organizationId,
    tipo: 'salida',
  };
  if (filters.productoAccesoId) where['productoAccesoId'] = filters.productoAccesoId;
  if (dateFromStr && dateToStr) {
    where['fecha'] = { [Op.between]: [dateFromStr, dateToStr] };
  } else if (dateFromStr) {
    where['fecha'] = { [Op.gte]: dateFromStr };
  } else if (dateToStr) {
    where['fecha'] = { [Op.lte]: dateToStr };
  }

  type AggRow = {
    totalCantidad: string;
    totalMontoTotal: string | null;
    cantidadMovimientos: string;
  };
  const [totals] = (await MovimientoStockAcceso.findAll({
    where,
    attributes: [
      [sequelize.fn('SUM', sequelize.col('cantidad')), 'totalCantidad'],
      [
        sequelize.fn('SUM', sequelize.cast(sequelize.col('montoTotal'), 'DECIMAL(12,2)')),
        'totalMontoTotal',
      ],
      [sequelize.fn('COUNT', sequelize.col('id')), 'cantidadMovimientos'],
    ],
    raw: true,
  })) as unknown as AggRow[];

  const totalCantidad = totals ? Number(totals.totalCantidad) || 0 : 0;
  const totalMontoTotal = totals?.totalMontoTotal != null ? Number(totals.totalMontoTotal) : 0;
  const cantidadMovimientos = totals ? Number(totals.cantidadMovimientos) || 0 : 0;

  let porProducto: ReporteSalidasStockItem['porProducto'];
  if (!filters.productoAccesoId && (dateFromStr || dateToStr)) {
    type ProductAggRow = {
      productoAccesoId: UUID;
      cantidad: string;
      montoTotal: string | null;
      cantidadMovimientos: string;
    };
    const byProduct = (await MovimientoStockAcceso.findAll({
      where,
      attributes: [
        'productoAccesoId',
        [sequelize.fn('SUM', sequelize.col('cantidad')), 'cantidad'],
        [
          sequelize.fn('SUM', sequelize.cast(sequelize.col('montoTotal'), 'DECIMAL(12,2)')),
          'montoTotal',
        ],
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidadMovimientos'],
      ],
      group: ['productoAccesoId'],
      raw: true,
    })) as unknown as ProductAggRow[];

    const productIds = [...new Set((byProduct || []).map((r) => r.productoAccesoId))];
    const products =
      productIds.length > 0
        ? await ProductoAcceso.findAll({
            where: { id: { [Op.in]: productIds }, organizationId },
            attributes: ['id', 'name'],
          })
        : [];
    const nameById = new Map(products.map((p) => [p.id, p.name]));

    porProducto = (byProduct || []).map((r) => ({
      productoAccesoId: r.productoAccesoId,
      productName: nameById.get(r.productoAccesoId) ?? '',
      cantidad: Number(r.cantidad) || 0,
      montoTotal: r.montoTotal != null ? Number(r.montoTotal) : 0,
      cantidadMovimientos: Number(r.cantidadMovimientos) || 0,
    }));
  }

  return {
    totalCantidad,
    totalMontoTotal,
    cantidadMovimientos,
    dateFrom: dateFromStr ?? null,
    dateTo: dateToStr ?? null,
    ...(porProducto !== undefined && { porProducto }),
  };
};

/**
 * Reporte de ventas (salidas con motivo venta) agrupadas por prestador.
 */
export const getReporteVentasPorPrestador = async (
  organizationId: UUID,
  filters: ReporteVentasPrestadoresDTO,
  userId: UUID
): Promise<ReporteVentasPrestadoresItem[]> => {
  await assertCanAccessOrganization(userId, organizationId);
  validateDateRange(filters.dateFrom, filters.dateTo);

  const dateFromStr = toDateStr(filters.dateFrom);
  const dateToStr = toDateStr(filters.dateTo);

  const where: Record<string, unknown> = {
    organizationId,
    tipo: 'salida',
    motivo: 'venta',
  };
  if (dateFromStr && dateToStr) {
    where['fecha'] = { [Op.between]: [dateFromStr, dateToStr] };
  } else if (dateFromStr) {
    where['fecha'] = { [Op.gte]: dateFromStr };
  } else if (dateToStr) {
    where['fecha'] = { [Op.lte]: dateToStr };
  }

  type PrestadorAggRow = {
    prestadorId: string | null;
    totalCantidad: string;
    totalMontoTotal: string | null;
    cantidadMovimientos: string;
  };
  const rows = (await MovimientoStockAcceso.findAll({
    where,
    attributes: [
      'prestadorId',
      [sequelize.fn('SUM', sequelize.col('cantidad')), 'totalCantidad'],
      [
        sequelize.fn('SUM', sequelize.cast(sequelize.col('montoTotal'), 'DECIMAL(12,2)')),
        'totalMontoTotal',
      ],
      [sequelize.fn('COUNT', sequelize.col('id')), 'cantidadMovimientos'],
    ],
    group: ['prestadorId'],
    raw: true,
  })) as unknown as PrestadorAggRow[];

  const prestadorIds = [
    ...new Set((rows || []).map((r) => r.prestadorId).filter(Boolean)),
  ] as UUID[];
  const prestadores =
    prestadorIds.length > 0
      ? await PrestadorProfile.findAll({
          where: { id: { [Op.in]: prestadorIds }, organizationId },
          include: [{ model: User, as: 'User', attributes: ['name'] }],
        })
      : [];

  const nameByPrestador = new Map<UUID, string>();
  for (const p of prestadores) {
    const user = (p as PrestadorProfile & { User?: User }).User;
    nameByPrestador.set(p.id, user?.name ?? '');
  }

  const items: ReporteVentasPrestadoresItem[] = (rows || []).map((r) => ({
    prestadorId: r.prestadorId as UUID | null,
    prestadorName: r.prestadorId ? (nameByPrestador.get(r.prestadorId) ?? null) : null,
    totalCantidad: Number(r.totalCantidad) || 0,
    totalMontoTotal: r.totalMontoTotal != null ? Number(r.totalMontoTotal) : 0,
    cantidadMovimientos: Number(r.cantidadMovimientos) || 0,
  }));

  return items.sort((a, b) => (a.prestadorName ?? '').localeCompare(b.prestadorName ?? ''));
};

/**
 * Reporte de ventas por producto y fecha.
 */
export const getReporteVentasPorProducto = async (
  organizationId: UUID,
  filters: ReporteVentasPorProductoDTO,
  userId: UUID
): Promise<ReporteVentasPorProductoItem[]> => {
  await assertCanAccessOrganization(userId, organizationId);
  validateDateRange(filters.dateFrom, filters.dateTo);

  const dateFromStr = toDateStr(filters.dateFrom);
  const dateToStr = toDateStr(filters.dateTo);

  const where: Record<string, unknown> = {
    organizationId,
    tipo: 'salida',
    motivo: 'venta',
  };
  if (filters.productoAccesoId) where['productoAccesoId'] = filters.productoAccesoId;
  if (dateFromStr && dateToStr) {
    where['fecha'] = { [Op.between]: [dateFromStr, dateToStr] };
  } else if (dateFromStr) {
    where['fecha'] = { [Op.gte]: dateFromStr };
  } else if (dateToStr) {
    where['fecha'] = { [Op.lte]: dateToStr };
  }

  type ProductDateAggRow = {
    productoAccesoId: UUID;
    fecha: string;
    totalCantidad: string;
    totalMontoTotal: string | null;
    cantidadMovimientos: string;
  };

  const rows = (await MovimientoStockAcceso.findAll({
    where,
    attributes: [
      'productoAccesoId',
      'fecha',
      [sequelize.fn('SUM', sequelize.col('cantidad')), 'totalCantidad'],
      [
        sequelize.fn('SUM', sequelize.cast(sequelize.col('montoTotal'), 'DECIMAL(12,2)')),
        'totalMontoTotal',
      ],
      [sequelize.fn('COUNT', sequelize.col('id')), 'cantidadMovimientos'],
    ],
    group: ['productoAccesoId', 'fecha'],
    order: [
      ['fecha', 'ASC'],
      ['productoAccesoId', 'ASC'],
    ],
    raw: true,
    limit: MAX_RESULTS_LIMIT,
  })) as unknown as ProductDateAggRow[];

  const productIds = [...new Set((rows || []).map((r) => r.productoAccesoId))];
  const products =
    productIds.length > 0
      ? await ProductoAcceso.findAll({
          where: { id: { [Op.in]: productIds }, organizationId },
          attributes: ['id', 'name'],
        })
      : [];
  const nameById = new Map(products.map((p) => [p.id, p.name]));

  return (rows || []).map((r) => ({
    productoAccesoId: r.productoAccesoId,
    productName: nameById.get(r.productoAccesoId) ?? '',
    fecha: r.fecha,
    totalCantidad: Number(r.totalCantidad) || 0,
    totalMontoTotal: r.totalMontoTotal != null ? Number(r.totalMontoTotal) : 0,
    cantidadMovimientos: Number(r.cantidadMovimientos) || 0,
  }));
};
