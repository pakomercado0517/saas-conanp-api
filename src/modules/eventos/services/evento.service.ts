import { Op } from 'sequelize';
import { sequelize } from '@/shared/database/index.js';
import type { UUID } from '@/shared/database/types.js';
import { EventoOperativo } from '@/modules/eventos/models/evento-operativo.model.js';
import { Payment } from '@/modules/payments/models/payment.model.js';
import { Actividad } from '@/modules/actividades/models/actividad.model.js';
import { Bloque } from '@/modules/actividades/models/bloque.model.js';
import { PrestadorProfile } from '@/modules/prestadores/models/prestador-profile.model.js';
import { User } from '@/modules/users/models/user.model.js';
import { Membership } from '@/modules/users/models/membership.model.js';
import type {
  CreateEventoDTO,
  UpdateEventoDTO,
  ListEventosDTO,
} from '@/modules/eventos/validators/evento.validator.js';
import { NotFoundError, ValidationError, ForbiddenError } from '@/shared/errors/index.js';
import type { PaginationMeta } from '@/shared/responses/types.js';
import { logger } from '@/shared/logger/index.js';
import { assertCanAccessOrganization } from '@/modules/organizations/services/organization.service.js';
import { validatePrestadorHasPermisoVigente } from '@/modules/permisos/services/permiso.service.js';
import {
  verificarDisponibilidadPorBloque,
  verificarDisponibilidadPorDia,
} from '@/modules/actividades/services/capacidad.service.js';
import { checkEventosLimit } from '@/modules/subscriptions/services/subscription-limits.service.js';
import { toDateOnlyDB, toTimeOnly, DateTime } from '@/shared/dates/index.js';

/**
 * Helper interno: Valida permisos granulares para acceder a un evento.
 * - Los administradores pueden ver/editar cualquier evento
 * - Los prestadores solo pueden ver/editar sus propios eventos
 *
 * @param requestingUserId - ID del usuario que solicita acceso
 * @param eventoPrestadorId - ID del prestador dueño del evento
 * @param organizationId - ID de la organización
 * @throws {ForbiddenError} Si no tiene permisos para acceder al evento
 */
const validateEventoPermissions = async (
  requestingUserId: UUID,
  eventoPrestadorId: UUID,
  organizationId: UUID
): Promise<void> => {
  // Obtener membership para verificar rol
  const membership = await Membership.findOne({
    where: { userId: requestingUserId, organizationId, status: 'activo' },
  });

  if (!membership) {
    throw new ForbiddenError('No tienes acceso a esta organización', {
      organizationId,
      requestingUserId,
    });
  }

  // Si es admin, permitir acceso
  if (membership.role === 'admin') {
    return;
  }

  // Si es prestador, verificar que el evento pertenece a su prestadorId
  if (membership.role === 'prestador') {
    const prestador = await PrestadorProfile.findOne({
      where: { userId: requestingUserId, organizationId },
    });

    if (!prestador) {
      throw new ForbiddenError('No tienes un perfil de prestador en esta organización', {
        organizationId,
        requestingUserId,
      });
    }

    if (eventoPrestadorId !== prestador.id) {
      throw new ForbiddenError('Solo puedes ver y editar tus propios eventos', {
        organizationId,
        requestingUserId,
        eventoPrestadorId,
        prestadorId: prestador.id,
      });
    }
  }
};

/**
 * Crea un nuevo evento operativo.
 * Requiere validaciones estrictas de negocio y se ejecuta en una transacción.
 *
 * @param data - Datos del evento (con validación condicional por tipo de agenda)
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que crea
 * @returns Evento creado con relaciones cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si la actividad, bloque o prestador no existen
 * @throws {ValidationError} Si no se cumplen las validaciones de negocio
 */
export const createEvento = async (
  data: CreateEventoDTO,
  organizationId: UUID,
  userId: UUID
): Promise<EventoOperativo> => {
  // 1. Validar acceso a la organización
  await assertCanAccessOrganization(userId, organizationId);

  // 2. Validar que la actividad existe y pertenece a la organización
  const actividad = await Actividad.findOne({
    where: {
      id: data.actividadId,
      organizationId,
    },
  });

  if (!actividad) {
    throw new NotFoundError('Actividad', { actividadId: data.actividadId, organizationId });
  }

  // 3. Validar tipo de agenda
  if (data.agendaType !== actividad.agendaType) {
    throw new ValidationError(
      `El tipo de agenda proporcionado (${data.agendaType}) no coincide con el tipo de agenda de la actividad (${actividad.agendaType})`,
      undefined,
      {
        providedAgendaType: data.agendaType,
        actividadAgendaType: actividad.agendaType,
        actividadId: data.actividadId,
      }
    );
  }

  // Validar campos según tipo de agenda
  if (data.agendaType === 'BLOQUES') {
    if (!data.bloqueId) {
      throw new ValidationError(
        'Esta actividad requiere seleccionar un bloque (tipo de agenda: BLOQUES)',
        undefined,
        { actividadId: data.actividadId, agendaType: data.agendaType }
      );
    }

    // Validar que el bloque existe y pertenece a la actividad y organización
    const bloque = await Bloque.findOne({
      where: {
        id: data.bloqueId,
        actividadId: data.actividadId,
        organizationId,
      },
    });

    if (!bloque) {
      throw new NotFoundError('Bloque', {
        bloqueId: data.bloqueId,
        actividadId: data.actividadId,
        organizationId,
      });
    }
  } else if (data.agendaType === 'HORARIO_LIBRE') {
    if (!data.startTime || !data.endTime) {
      throw new ValidationError(
        'Esta actividad requiere definir hora de inicio y fin (tipo de agenda: HORARIO_LIBRE)',
        undefined,
        { actividadId: data.actividadId, agendaType: data.agendaType }
      );
    }
  }

  // 4. Validar que el prestador existe y pertenece a la organización
  const prestador = await PrestadorProfile.findOne({
    where: {
      id: data.prestadorId,
      organizationId,
    },
  });

  if (!prestador) {
    throw new NotFoundError('Prestador', { prestadorId: data.prestadorId, organizationId });
  }

  // 5. Validar permiso vigente
  const dateForValidation = data.date instanceof DateTime ? data.date : DateTime.fromISO(data.date);
  const permisoVigente = await validatePrestadorHasPermisoVigente(
    data.prestadorId,
    data.actividadId,
    organizationId,
    dateForValidation
  );

  if (!permisoVigente) {
    throw new ValidationError(
      'El prestador no tiene un permiso vigente para esta actividad en la fecha especificada',
      undefined,
      {
        prestadorId: data.prestadorId,
        actividadId: data.actividadId,
        date: toDateOnlyDB(data.date),
      }
    );
  }

  // 6. Validar capacidad disponible
  const dateStr = toDateOnlyDB(data.date);
  if (!dateStr) {
    throw new ValidationError('La fecha proporcionada no es válida');
  }

  let disponibilidad;
  if (data.agendaType === 'BLOQUES' && data.bloqueId) {
    disponibilidad = await verificarDisponibilidadPorBloque(
      data.actividadId,
      data.bloqueId,
      dateStr,
      data.peopleCount,
      organizationId
    );
  } else if (data.agendaType === 'HORARIO_LIBRE') {
    disponibilidad = await verificarDisponibilidadPorDia(
      data.actividadId,
      dateStr,
      data.peopleCount,
      organizationId
    );
  } else {
    throw new ValidationError('No se pudo determinar el tipo de agenda para validar capacidad');
  }

  if (!disponibilidad.disponible) {
    throw new ValidationError(
      `No hay capacidad disponible. Capacidad disponible: ${disponibilidad.capacidadDisponible}, solicitada: ${data.peopleCount}`,
      undefined,
      {
        capacidadTotal: disponibilidad.capacidadTotal,
        capacidadUsada: disponibilidad.capacidadUsada,
        capacidadDisponible: disponibilidad.capacidadDisponible,
        limite: disponibilidad.limite,
        peopleCount: data.peopleCount,
      }
    );
  }

  // 7. Validar límite de eventos del plan de suscripción
  await checkEventosLimit(organizationId);

  // 8. Validar activos aprobados (preparado para futuro)
  // Si en el futuro los eventos requieren activos, validar aquí:
  // await validateActivoAprobado(activoId, organizationId);

  // Iniciar transacción
  const transaction = await sequelize.transaction();

  try {
    // Convertir fechas/horas de DateTime a strings para BD
    const startTimeStr =
      data.agendaType === 'HORARIO_LIBRE' && data.startTime ? toTimeOnly(data.startTime) : null;
    const endTimeStr =
      data.agendaType === 'HORARIO_LIBRE' && data.endTime ? toTimeOnly(data.endTime) : null;

    if (data.agendaType === 'HORARIO_LIBRE' && (!startTimeStr || !endTimeStr)) {
      throw new ValidationError('Los horarios proporcionados no son válidos');
    }

    // Crear el evento
    const evento = await EventoOperativo.create(
      {
        organizationId,
        prestadorId: data.prestadorId,
        actividadId: data.actividadId,
        date: dateStr,
        bloqueId: data.agendaType === 'BLOQUES' ? data.bloqueId : null,
        startTime: startTimeStr,
        endTime: endTimeStr,
        peopleCount: data.peopleCount,
        status: 'programado',
        paymentRequired: data.paymentRequired ?? false,
      },
      { transaction }
    );

    // Commit de la transacción
    await transaction.commit();

    // Cargar relaciones para retornar datos completos
    await evento.reload({
      include: [
        { model: Actividad, as: 'Actividad' },
        { model: PrestadorProfile, as: 'PrestadorProfile' },
        { model: Bloque, as: 'Bloque', required: false },
      ],
    });

    logger.info(
      {
        eventoId: evento.id,
        organizationId,
        prestadorId: evento.prestadorId,
        actividadId: evento.actividadId,
        date: evento.date,
        userId,
      },
      'Evento creado exitosamente'
    );

    return evento;
  } catch (error) {
    // Rollback en caso de error
    await transaction.rollback();
    throw error;
  }
};

/**
 * Obtiene un evento por ID.
 * Valida permisos granulares: prestadores solo pueden ver sus propios eventos.
 *
 * @param eventoId - ID del evento
 * @param organizationId - ID de la organización (multi-tenant)
 * @param requestingUserId - ID del usuario que solicita
 * @returns Evento encontrado con relaciones cargadas
 * @throws {ForbiddenError} Si no tiene acceso o no tiene permisos
 * @throws {NotFoundError} Si el evento no existe o no pertenece a la organización
 */
export const getEventoById = async (
  eventoId: UUID,
  organizationId: UUID,
  requestingUserId: UUID
): Promise<EventoOperativo> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(requestingUserId, organizationId);

  // Buscar evento con filtro multi-tenant y excluir eliminados
  const evento = await EventoOperativo.findOne({
    where: {
      id: eventoId,
      organizationId,
      deletedAt: null,
    } as unknown as Record<string, unknown>,
    include: [
      { model: Actividad, as: 'Actividad' },
      { model: PrestadorProfile, as: 'PrestadorProfile' },
      { model: Bloque, as: 'Bloque', required: false },
    ],
  });

  if (!evento) {
    throw new NotFoundError('Evento', { eventoId, organizationId });
  }

  // Validar permisos granulares
  await validateEventoPermissions(requestingUserId, evento.prestadorId, organizationId);

  return evento;
};

/**
 * Lista eventos con paginación y filtros.
 * Valida permisos granulares: prestadores solo pueden ver sus propios eventos.
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros de paginación y búsqueda
 * @param requestingUserId - ID del usuario que solicita
 * @returns Datos paginados de eventos con relaciones cargadas
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 */
export const listEventos = async (
  organizationId: UUID,
  filters: ListEventosDTO,
  requestingUserId: UUID
): Promise<{ data: EventoOperativo[]; pagination: PaginationMeta }> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(requestingUserId, organizationId);

  // Obtener membership del usuario para determinar permisos
  const membership = await Membership.findOne({
    where: { userId: requestingUserId, organizationId, status: 'activo' },
  });

  if (!membership) {
    throw new ForbiddenError('No tienes acceso a esta organización', {
      organizationId,
      requestingUserId,
    });
  }

  // Construir query con filtros multi-tenant obligatorio
  const where: Record<string, unknown> = {
    organizationId, // Multi-tenant obligatorio
    deletedAt: null, // Excluir eliminados
  } as unknown as Record<string, unknown>;

  // Permisos granulares: Si es prestador, solo puede ver sus propios eventos
  if (membership.role === 'prestador') {
    const prestador = await PrestadorProfile.findOne({
      where: { userId: requestingUserId, organizationId },
    });

    if (!prestador) {
      throw new ForbiddenError('No tienes un perfil de prestador en esta organización', {
        organizationId,
        requestingUserId,
      });
    }

    where['prestadorId'] = prestador.id;
  }

  // Aplicar filtros opcionales
  if (filters.actividadId) {
    where['actividadId'] = filters.actividadId;
  }
  if (filters.prestadorId) {
    where['prestadorId'] = filters.prestadorId;
  }
  if (filters.status) {
    where['status'] = filters.status;
  }

  // Manejar filtros de fecha (date es DATEONLY, string YYYY-MM-DD)
  if (filters.date) {
    // Filtro por fecha exacta
    const dateStr =
      filters.date && typeof filters.date === 'object' && 'toFormat' in filters.date
        ? toDateOnlyDB(filters.date as DateTime)
        : (filters.date as string);
    where['date'] = dateStr;
  } else {
    // Si no hay fecha exacta, aplicar rangos si existen
    let dateFromStr: string | undefined;
    let dateToStr: string | undefined;

    if (filters.dateFrom) {
      // Convertir DateTime a string YYYY-MM-DD
      const converted =
        filters.dateFrom && typeof filters.dateFrom === 'object' && 'toFormat' in filters.dateFrom
          ? toDateOnlyDB(filters.dateFrom as DateTime)
          : (filters.dateFrom as string);
      dateFromStr = converted ?? undefined;
    }
    if (filters.dateTo) {
      // Convertir DateTime a string YYYY-MM-DD
      const converted =
        filters.dateTo && typeof filters.dateTo === 'object' && 'toFormat' in filters.dateTo
          ? toDateOnlyDB(filters.dateTo as DateTime)
          : (filters.dateTo as string);
      dateToStr = converted ?? undefined;
    }

    // Construir objeto de rango usando computed property names
    if (dateFromStr && dateToStr) {
      where['date'] = {
        [Op.gte]: dateFromStr,
        [Op.lte]: dateToStr,
      };
    } else if (dateFromStr) {
      where['date'] = {
        [Op.gte]: dateFromStr,
      };
    } else if (dateToStr) {
      where['date'] = {
        [Op.lte]: dateToStr,
      };
    }
  }

  if (filters.bloqueId) {
    where['bloqueId'] = filters.bloqueId;
  }

  // Configurar paginación
  const limit = filters.limit;
  const sortBy = filters.sortBy ?? 'createdAt';
  const sortOrder = filters.sortOrder ?? 'desc';
  const offset = (filters.page - 1) * limit;

  // Ejecutar query con paginación (includes con atributos mínimos para evitar sobrecarga)
  const result = await EventoOperativo.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sortBy, sortOrder]],
    include: [
      {
        model: Actividad,
        as: 'Actividad',
        attributes: ['id', 'name', 'type', 'agendaType', 'active'],
      },
      {
        model: PrestadorProfile,
        as: 'PrestadorProfile',
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
        model: Bloque,
        as: 'Bloque',
        required: false,
        attributes: ['id', 'startTime', 'endTime', 'capacity'],
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
 * Actualiza un evento existente.
 * Valida permisos granulares y revalida capacidad si se actualizan campos relevantes.
 *
 * @param eventoId - ID del evento a actualizar
 * @param organizationId - ID de la organización (multi-tenant)
 * @param data - Datos a actualizar
 * @param requestingUserId - ID del usuario que actualiza
 * @returns Evento actualizado con relaciones cargadas
 * @throws {ForbiddenError} Si no tiene acceso o no tiene permisos
 * @throws {NotFoundError} Si el evento no existe o no pertenece a la organización
 * @throws {ValidationError} Si no se cumplen las validaciones de negocio
 */
export const updateEvento = async (
  eventoId: UUID,
  organizationId: UUID,
  data: UpdateEventoDTO,
  requestingUserId: UUID
): Promise<EventoOperativo> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(requestingUserId, organizationId);

  // Buscar evento existente
  const evento = await EventoOperativo.findOne({
    where: {
      id: eventoId,
      organizationId,
      deletedAt: null,
    } as unknown as Record<string, unknown>,
    include: [{ model: Actividad, as: 'Actividad' }],
  });

  if (!evento) {
    throw new NotFoundError('Evento', { eventoId, organizationId });
  }

  // Validar permisos granulares
  await validateEventoPermissions(requestingUserId, evento.prestadorId, organizationId);

  // Si se actualiza date o bloqueId/startTime/endTime, validar capacidad disponible nuevamente
  const needsCapacityValidation =
    data.date !== undefined ||
    data.bloqueId !== undefined ||
    data.startTime !== undefined ||
    data.endTime !== undefined;

  if (needsCapacityValidation) {
    const actividad = evento.Actividad || (await Actividad.findByPk(evento.actividadId));
    if (!actividad) {
      throw new NotFoundError('Actividad', { actividadId: evento.actividadId, organizationId });
    }

    const dateStr = data.date ? toDateOnlyDB(data.date) : evento.date;
    if (!dateStr) {
      throw new ValidationError('La fecha proporcionada no es válida');
    }

    const bloqueId = data.bloqueId !== undefined ? data.bloqueId : evento.bloqueId;
    const peopleCount = data.peopleCount !== undefined ? data.peopleCount : evento.peopleCount;

    let disponibilidad;
    if (actividad.agendaType === 'BLOQUES' && bloqueId) {
      disponibilidad = await verificarDisponibilidadPorBloque(
        actividad.id,
        bloqueId,
        dateStr,
        peopleCount,
        organizationId
      );
    } else if (actividad.agendaType === 'HORARIO_LIBRE') {
      disponibilidad = await verificarDisponibilidadPorDia(
        actividad.id,
        dateStr,
        peopleCount,
        organizationId
      );
    } else {
      throw new ValidationError('No se pudo determinar el tipo de agenda para validar capacidad');
    }

    if (!disponibilidad.disponible) {
      throw new ValidationError(
        `No hay capacidad disponible. Capacidad disponible: ${disponibilidad.capacidadDisponible}, solicitada: ${peopleCount}`,
        undefined,
        {
          capacidadTotal: disponibilidad.capacidadTotal,
          capacidadUsada: disponibilidad.capacidadUsada,
          capacidadDisponible: disponibilidad.capacidadDisponible,
          limite: disponibilidad.limite,
          peopleCount,
        }
      );
    }
  }

  // Preparar datos de actualización
  const updateData: Partial<{
    date: string;
    bloqueId: UUID | null;
    startTime: string | null;
    endTime: string | null;
    peopleCount: number;
    status: 'programado' | 'en_curso' | 'completado' | 'cancelado';
    paymentRequired: boolean;
  }> = {};

  // Actualizar date si se proporciona
  if (data.date !== undefined) {
    const dateStr = toDateOnlyDB(data.date);
    if (!dateStr) {
      throw new ValidationError('La fecha proporcionada no es válida');
    }
    updateData.date = dateStr;
  }

  // Actualizar bloqueId si se proporciona
  if (data.bloqueId !== undefined) {
    updateData.bloqueId = data.bloqueId;
  }

  // Actualizar startTime si se proporciona
  if (data.startTime !== undefined) {
    updateData.startTime = data.startTime ? toTimeOnly(data.startTime) : null;
  }

  // Actualizar endTime si se proporciona
  if (data.endTime !== undefined) {
    updateData.endTime = data.endTime ? toTimeOnly(data.endTime) : null;
  }

  // Actualizar peopleCount si se proporciona
  if (data.peopleCount !== undefined) {
    updateData.peopleCount = data.peopleCount;
  }

  // Actualizar status si se proporciona
  if (data.status !== undefined) {
    const newStatus = data.status;
    const requiresPayment = evento.paymentRequired || data.paymentRequired === true;
    if ((newStatus === 'en_curso' || newStatus === 'completado') && requiresPayment) {
      const hasPaid = await eventoHasPagoCompletado(eventoId, organizationId);
      if (!hasPaid) {
        throw new ValidationError(
          'No se puede confirmar el evento sin pago completado cuando el evento requiere pago',
          undefined,
          { eventoId, organizationId }
        );
      }
    }
    updateData.status = data.status;
  }

  // Actualizar paymentRequired si se proporciona
  if (data.paymentRequired !== undefined) {
    updateData.paymentRequired = data.paymentRequired;
  }

  // Actualizar el evento
  await evento.update(updateData);

  // Cargar relaciones para retornar datos completos
  await evento.reload({
    include: [
      { model: Actividad, as: 'Actividad' },
      { model: PrestadorProfile, as: 'PrestadorProfile' },
      { model: Bloque, as: 'Bloque', required: false },
    ],
  });

  const updatedKeys = Object.keys(updateData);

  logger.info(
    {
      eventoId: evento.id,
      organizationId,
      updatedFields: updatedKeys,
      requestingUserId,
    },
    'Evento actualizado exitosamente'
  );

  return evento;
};

/**
 * Elimina un evento (soft delete).
 * Valida permisos granulares: prestadores solo pueden eliminar sus propios eventos.
 *
 * @param eventoId - ID del evento
 * @param organizationId - ID de la organización (multi-tenant)
 * @param requestingUserId - ID del usuario que elimina
 * @throws {ForbiddenError} Si no tiene acceso a la organización o no tiene permisos
 * @throws {NotFoundError} Si el evento no existe o no pertenece a la organización
 */
export const deleteEvento = async (
  eventoId: UUID,
  organizationId: UUID,
  requestingUserId: UUID
): Promise<void> => {
  // Validar acceso a la organización
  await assertCanAccessOrganization(requestingUserId, organizationId);

  // Buscar evento con filtro multi-tenant y excluir eliminados
  const evento = await EventoOperativo.findOne({
    where: {
      id: eventoId,
      organizationId,
      deletedAt: null,
    } as unknown as Record<string, unknown>,
  });

  if (!evento) {
    throw new NotFoundError('Evento', { eventoId, organizationId });
  }

  // Validar permisos granulares
  await validateEventoPermissions(requestingUserId, evento.prestadorId, organizationId);

  // Realizar soft delete manual
  // Nota: El modelo no tiene paranoid: true, por lo que se usa soft delete manual
  // Se asume que el campo deletedAt existe en la tabla (puede requerir migración)
  await evento.update({ deletedAt: new Date() } as unknown as Partial<EventoOperativo>);

  logger.info(
    {
      eventoId,
      organizationId,
      requestingUserId,
    },
    'Evento eliminado exitosamente (soft delete)'
  );
};

/**
 * Verifica si el evento tiene al menos un pago completado (status 'succeeded').
 * Usa la tabla Payment como fuente de verdad, no paidAt.
 *
 * @param eventoId - ID del evento
 * @param organizationId - ID de la organización (opcional, para multi-tenant)
 * @returns true si existe al menos un pago succeeded para el evento
 */
export const eventoHasPagoCompletado = async (
  eventoId: UUID,
  organizationId?: UUID
): Promise<boolean> => {
  const where: Record<string, unknown> = {
    eventoId,
    status: 'succeeded',
  };
  if (organizationId) {
    where['organizationId'] = organizationId;
  }
  const payment = await Payment.findOne({
    where: where as Record<string, unknown>,
  });
  return !!payment;
};

/**
 * Marca el evento como pagado (paidAt = now).
 * Idempotente. Se invoca desde el flujo de pagos al completar un pago.
 *
 * @param eventoId - ID del evento
 * @param organizationId - ID de la organización (multi-tenant)
 */
export const markEventoPaid = async (eventoId: UUID, organizationId: UUID): Promise<void> => {
  const evento = await EventoOperativo.findOne({
    where: { id: eventoId, organizationId },
  });
  if (!evento) {
    return;
  }
  await evento.update({ paidAt: new Date() });
  logger.info({ eventoId, organizationId }, 'Evento marcado como pagado (paidAt actualizado)');
};

/**
 * Desmarca el evento como pagado (paidAt = null) solo si no queda
 * ningún otro pago succeeded para el mismo evento.
 * Se invoca desde el flujo de pagos en reembolso total.
 *
 * @param eventoId - ID del evento
 * @param organizationId - ID de la organización (multi-tenant)
 */
export const unmarkEventoPaid = async (eventoId: UUID, organizationId: UUID): Promise<void> => {
  const other = await Payment.findOne({
    where: {
      eventoId,
      organizationId,
      status: 'succeeded',
    },
  });
  if (other) {
    return;
  }
  const evento = await EventoOperativo.findOne({
    where: { id: eventoId, organizationId },
  });
  if (!evento) {
    return;
  }
  await evento.update({ paidAt: null });
  logger.info({ eventoId, organizationId }, 'Evento desmarcado como pagado (paidAt limpiado)');
};
