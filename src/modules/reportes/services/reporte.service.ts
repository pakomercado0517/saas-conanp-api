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
import type {
  ReporteEventosPorActividadDTO,
  ReporteEventosPorPrestadorDTO,
  ReporteEventosPorFechaDTO,
  ReporteCapacidadUtilizadaDTO,
  ReportePrestadoresActivosDTO,
} from '@/modules/reportes/validators/reporte.validator.js';
import type {
  ReporteEventosPorActividadItem,
  ReporteEventosPorPrestadorItem,
  ReporteEventosPorFechaItem,
  ReporteCapacidadUtilizadaItem,
  ReportePrestadoresActivosItem,
} from '@/modules/reportes/types/reporte.types.js';
import { assertCanAccessOrganization } from '@/modules/organizations/services/organization.service.js';
import { toDateOnlyDB, DateTime } from '@/shared/dates/index.js';
import { ValidationError } from '@/shared/errors/index.js';

/**
 * Obtiene reporte de eventos agrupados por actividad
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros opcionales (actividadId, dateFrom, dateTo, status)
 * @param userId - ID del usuario que solicita
 * @returns Array con datos agrupados por actividad
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 */
export const getReporteEventosPorActividad = async (
  organizationId: UUID,
  filters: ReporteEventosPorActividadDTO,
  userId: UUID
): Promise<ReporteEventosPorActividadItem[]> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(userId, organizationId);

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

  // Obtener eventos con relación a Actividad
  const eventos = await EventoOperativo.findAll({
    where: whereClause,
    include: [
      {
        model: Actividad,
        as: 'Actividad',
        required: true,
        attributes: ['id', 'name'],
      },
    ],
    attributes: ['id', 'actividadId', 'date', 'status', 'peopleCount'],
  });

  // Agrupar por actividad
  const agrupado = new Map<UUID, ReporteEventosPorActividadItem>();

  for (const evento of eventos) {
    const actividadId = evento.actividadId;
    const actividad = evento.Actividad;

    if (!actividad) continue;

    if (!agrupado.has(actividadId)) {
      agrupado.set(actividadId, {
        actividadId,
        actividadName: actividad.name,
        totalEventos: 0,
        totalPersonas: 0,
        eventosPorStatus: {
          programado: 0,
          en_curso: 0,
          completado: 0,
          cancelado: 0,
        },
        fechaInicio: null,
        fechaFin: null,
      });
    }

    const item = agrupado.get(actividadId)!;
    item.totalEventos += 1;
    item.totalPersonas += evento.peopleCount;
    item.eventosPorStatus[evento.status as keyof typeof item.eventosPorStatus] += 1;

    // Actualizar fechas
    if (!item.fechaInicio || evento.date < item.fechaInicio) {
      item.fechaInicio = evento.date;
    }
    if (!item.fechaFin || evento.date > item.fechaFin) {
      item.fechaFin = evento.date;
    }
  }

  return Array.from(agrupado.values());
};

/**
 * Obtiene reporte de eventos agrupados por prestador
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros opcionales (prestadorId, dateFrom, dateTo, status)
 * @param userId - ID del usuario que solicita
 * @returns Array con datos agrupados por prestador
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 */
export const getReporteEventosPorPrestador = async (
  organizationId: UUID,
  filters: ReporteEventosPorPrestadorDTO,
  userId: UUID
): Promise<ReporteEventosPorPrestadorItem[]> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(userId, organizationId);

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

  // Obtener eventos con relaciones
  const eventos = await EventoOperativo.findAll({
    where: whereClause,
    include: [
      {
        model: PrestadorProfile,
        as: 'PrestadorProfile',
        required: true,
        include: [
          {
            model: User,
            as: 'User',
            required: true,
            attributes: ['id', 'name'],
          },
        ],
        attributes: ['id'],
      },
      {
        model: Actividad,
        as: 'Actividad',
        required: true,
        attributes: ['id', 'name'],
      },
    ],
    attributes: ['id', 'prestadorId', 'actividadId', 'date', 'status', 'peopleCount'],
  });

  // Agrupar por prestador
  const agrupado = new Map<UUID, ReporteEventosPorPrestadorItem>();
  const actividadesPorPrestador = new Map<
    UUID,
    Map<UUID, { actividadId: UUID; actividadName: string; totalEventos: number }>
  >();

  for (const evento of eventos) {
    const prestadorId = evento.prestadorId;
    const prestador = evento.PrestadorProfile;
    const user = prestador?.User;
    const actividad = evento.Actividad;

    if (!prestador || !user || !actividad) continue;

    if (!agrupado.has(prestadorId)) {
      agrupado.set(prestadorId, {
        prestadorId,
        prestadorName: user.name,
        totalEventos: 0,
        totalPersonas: 0,
        eventosPorStatus: {
          programado: 0,
          en_curso: 0,
          completado: 0,
          cancelado: 0,
        },
        actividadesRealizadas: [],
        fechaInicio: null,
        fechaFin: null,
      });
      actividadesPorPrestador.set(prestadorId, new Map());
    }

    const item = agrupado.get(prestadorId)!;
    item.totalEventos += 1;
    item.totalPersonas += evento.peopleCount;
    item.eventosPorStatus[evento.status as keyof typeof item.eventosPorStatus] += 1;

    // Actualizar fechas
    if (!item.fechaInicio || evento.date < item.fechaInicio) {
      item.fechaInicio = evento.date;
    }
    if (!item.fechaFin || evento.date > item.fechaFin) {
      item.fechaFin = evento.date;
    }

    // Agrupar por actividad
    const actividadesMap = actividadesPorPrestador.get(prestadorId)!;
    if (!actividadesMap.has(actividad.id)) {
      actividadesMap.set(actividad.id, {
        actividadId: actividad.id,
        actividadName: actividad.name,
        totalEventos: 0,
      });
    }
    actividadesMap.get(actividad.id)!.totalEventos += 1;
  }

  // Agregar actividades realizadas a cada prestador
  for (const [prestadorId, item] of agrupado.entries()) {
    const actividadesMap = actividadesPorPrestador.get(prestadorId);
    if (actividadesMap) {
      item.actividadesRealizadas = Array.from(actividadesMap.values());
    }
  }

  return Array.from(agrupado.values());
};

/**
 * Obtiene reporte de eventos agrupados por fecha
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros (dateFrom o dateTo requeridos, actividadId opcional, prestadorId opcional)
 * @param userId - ID del usuario que solicita
 * @returns Array con datos agrupados por fecha
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {ValidationError} Si no se proporciona dateFrom o dateTo
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

  // Obtener eventos con relaciones
  const eventos = await EventoOperativo.findAll({
    where: whereClause,
    include: [
      {
        model: Actividad,
        as: 'Actividad',
        required: true,
        attributes: ['id', 'name'],
      },
    ],
    attributes: ['id', 'actividadId', 'date', 'status', 'peopleCount'],
  });

  // Agrupar por fecha
  const agrupado = new Map<string, ReporteEventosPorFechaItem>();
  const actividadesPorFecha = new Map<
    string,
    Map<
      UUID,
      { actividadId: UUID; actividadName: string; totalEventos: number; totalPersonas: number }
    >
  >();

  for (const evento of eventos) {
    const date = evento.date;
    const actividad = evento.Actividad;

    if (!actividad) continue;

    if (!agrupado.has(date)) {
      agrupado.set(date, {
        date,
        totalEventos: 0,
        totalPersonas: 0,
        eventosPorActividad: [],
        eventosPorStatus: {
          programado: 0,
          en_curso: 0,
          completado: 0,
          cancelado: 0,
        },
      });
      actividadesPorFecha.set(date, new Map());
    }

    const item = agrupado.get(date)!;
    item.totalEventos += 1;
    item.totalPersonas += evento.peopleCount;
    item.eventosPorStatus[evento.status as keyof typeof item.eventosPorStatus] += 1;

    // Agrupar por actividad
    const actividadesMap = actividadesPorFecha.get(date)!;
    if (!actividadesMap.has(actividad.id)) {
      actividadesMap.set(actividad.id, {
        actividadId: actividad.id,
        actividadName: actividad.name,
        totalEventos: 0,
        totalPersonas: 0,
      });
    }
    const actividadItem = actividadesMap.get(actividad.id)!;
    actividadItem.totalEventos += 1;
    actividadItem.totalPersonas += evento.peopleCount;
  }

  // Agregar actividades por fecha
  for (const [date, item] of agrupado.entries()) {
    const actividadesMap = actividadesPorFecha.get(date);
    if (actividadesMap) {
      item.eventosPorActividad = Array.from(actividadesMap.values());
    }
  }

  // Ordenar por fecha
  return Array.from(agrupado.values()).sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Obtiene reporte de capacidad utilizada
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros opcionales (actividadId, dateFrom, dateTo)
 * @param userId - ID del usuario que solicita
 * @returns Array con datos de capacidad utilizada
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 */
export const getReporteCapacidadUtilizada = async (
  organizationId: UUID,
  filters: ReporteCapacidadUtilizadaDTO,
  userId: UUID
): Promise<ReporteCapacidadUtilizadaItem[]> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(userId, organizationId);

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
