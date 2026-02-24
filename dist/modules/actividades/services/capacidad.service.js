import { Op } from 'sequelize';
import { Capacidad } from '../../../modules/actividades/models/capacidad.model.js';
import { Actividad } from '../../../modules/actividades/models/actividad.model.js';
import { Bloque } from '../../../modules/actividades/models/bloque.model.js';
import { EventoOperativo } from '../../../modules/eventos/models/evento-operativo.model.js';
import { NotFoundError, ValidationError, ConflictError } from '../../../shared/errors/index.js';
import { logger } from '../../../shared/logger/index.js';
import { assertCanAccessOrganization } from '../../../modules/organizations/services/organization.service.js';
import { assertIsAdmin } from '../../../modules/users/services/membership.service.js';
import { toDateOnlyDB, DateTime } from '../../../shared/dates/index.js';
/**
 * Helper interno: Calcula la capacidad usada para una actividad, fecha y bloque (opcional)
 *
 * @param actividadId - ID de la actividad
 * @param date - Fecha en formato YYYY-MM-DD
 * @param organizationId - ID de la organización (multi-tenant)
 * @param bloqueId - ID del bloque (opcional, solo para BLOQUES)
 * @returns Capacidad usada (suma de peopleCount de eventos activos)
 */
const calcularCapacidadUsada = async (actividadId, date, organizationId, bloqueId) => {
    const whereClause = {
        actividadId,
        date,
        areaId: organizationId,
        status: { [Op.in]: ['programado', 'en_curso'] },
    };
    // Si hay bloqueId, filtrar por bloque específico
    // Si bloqueId es explícitamente null, filtrar eventos sin bloqueId (HORARIO_LIBRE)
    if (bloqueId !== undefined) {
        if (bloqueId === null) {
            whereClause['bloqueId'] = { [Op.is]: null };
        }
        else {
            whereClause['bloqueId'] = bloqueId;
        }
    }
    const capacidadUsada = (await EventoOperativo.sum('peopleCount', {
        where: whereClause,
    })) || 0;
    return capacidadUsada;
};
/**
 * Crea una nueva capacidad para una actividad y fecha.
 * Solo los administradores pueden crear capacidades.
 *
 * @param data - Datos de la capacidad
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que crea (debe ser admin)
 * @returns Capacidad creada
 * @throws {ForbiddenError} Si no es admin o no tiene acceso
 * @throws {NotFoundError} Si la actividad no existe
 * @throws {ConflictError} Si ya existe una capacidad para esa actividad y fecha
 */
export const createCapacidad = async (data, organizationId, userId) => {
    // Validar que el usuario sea admin
    await assertIsAdmin(userId, organizationId);
    // Validar acceso a la organización
    await assertCanAccessOrganization(userId, organizationId);
    // Validar que la actividad existe y pertenece a la organización
    const actividad = await Actividad.findOne({
        where: {
            id: data.actividadId,
            areaId: organizationId,
        },
    });
    if (!actividad) {
        throw new NotFoundError('Actividad', { actividadId: data.actividadId, organizationId });
    }
    // Convertir fecha de DateTime a string YYYY-MM-DD
    const dateStr = toDateOnlyDB(data['date']);
    if (!dateStr) {
        throw new ValidationError('La fecha proporcionada no es válida');
    }
    // Verificar que no exista ya una capacidad para esa actividad y fecha (índice único)
    const existingCapacidad = await Capacidad.findOne({
        where: {
            actividadId: data.actividadId,
            date: dateStr,
            areaId: organizationId,
        },
    });
    if (existingCapacidad) {
        throw new ConflictError('Ya existe una capacidad para esta actividad y fecha', {
            actividadId: data.actividadId,
            date: dateStr,
            organizationId,
        });
    }
    // Crear la capacidad
    const capacidad = await Capacidad.create({
        areaId: organizationId,
        actividadId: data.actividadId,
        date: dateStr,
        limit: data.limit,
    });
    logger.info({
        capacidadId: capacidad.id,
        organizationId,
        actividadId: capacidad.actividadId,
        date: capacidad.date,
        limit: capacidad.limit,
        userId,
    }, 'Capacidad creada exitosamente');
    return capacidad;
};
/**
 * Actualiza una capacidad existente.
 * Solo los administradores pueden actualizar capacidades.
 *
 * @param capacidadId - ID de la capacidad
 * @param organizationId - ID de la organización (multi-tenant)
 * @param data - Datos a actualizar
 * @param userId - ID del usuario que actualiza (debe ser admin)
 * @returns Capacidad actualizada
 * @throws {ForbiddenError} Si no es admin o no tiene acceso
 * @throws {NotFoundError} Si la capacidad no existe
 * @throws {ConflictError} Si al actualizar la fecha, ya existe otra capacidad para la nueva fecha
 */
export const updateCapacidad = async (capacidadId, organizationId, data, userId) => {
    // Validar que el usuario sea admin
    await assertIsAdmin(userId, organizationId);
    // Validar acceso a la organización
    await assertCanAccessOrganization(userId, organizationId);
    // Buscar capacidad con filtro multi-tenant
    const capacidad = await Capacidad.findOne({
        where: {
            id: capacidadId,
            areaId: organizationId,
        },
        include: [
            {
                model: Actividad,
                as: 'Actividad',
                required: false,
            },
        ],
    });
    if (!capacidad) {
        throw new NotFoundError('Capacidad', { capacidadId, organizationId });
    }
    // Preparar datos de actualización
    const updateData = {};
    // Convertir y actualizar fecha si se proporciona
    if (data['date'] !== undefined && data['date'] !== null) {
        const dateStr = toDateOnlyDB(data['date']);
        if (!dateStr) {
            throw new ValidationError('La fecha proporcionada no es válida');
        }
        // Verificar que no exista otra capacidad para la nueva fecha y misma actividad
        if (dateStr !== capacidad.date) {
            const existingCapacidad = await Capacidad.findOne({
                where: {
                    actividadId: capacidad.actividadId,
                    date: dateStr,
                    areaId: organizationId,
                    id: { [Op.ne]: capacidadId },
                },
            });
            if (existingCapacidad) {
                throw new ConflictError('Ya existe una capacidad para esta actividad y fecha', {
                    actividadId: capacidad.actividadId,
                    date: dateStr,
                    organizationId,
                });
            }
        }
        updateData.date = dateStr;
    }
    // Actualizar límite si se proporciona
    if (data['limit'] !== undefined) {
        updateData.limit = data['limit'];
    }
    // Actualizar la capacidad
    await capacidad.update(updateData);
    const updatedKeys = Object.keys(updateData);
    logger.info({
        capacidadId: capacidad.id,
        organizationId,
        updatedFields: updatedKeys,
        userId,
    }, 'Capacidad actualizada exitosamente');
    return capacidad;
};
/**
 * Verifica disponibilidad de capacidad para un bloque específico (actividades BLOQUES).
 *
 * @param actividadId - ID de la actividad
 * @param bloqueId - ID del bloque
 * @param date - Fecha (DateTime o string YYYY-MM-DD)
 * @param cantidad - Cantidad de personas/operaciones a verificar (default: 1)
 * @param organizationId - ID de la organización (multi-tenant)
 * @returns Resultado de disponibilidad
 * @throws {NotFoundError} Si la actividad o bloque no existen
 * @throws {ValidationError} Si la actividad no tiene tipo BLOQUES
 */
export const verificarDisponibilidadPorBloque = async (actividadId, bloqueId, date, cantidad, organizationId) => {
    // Validar que la actividad existe y tiene tipo BLOQUES
    const actividad = await Actividad.findOne({
        where: {
            id: actividadId,
            areaId: organizationId,
        },
    });
    if (!actividad) {
        throw new NotFoundError('Actividad', { actividadId, organizationId });
    }
    if (actividad.agendaType !== 'BLOQUES') {
        throw new ValidationError('Esta función solo aplica para actividades con tipo de agenda BLOQUES', undefined, { actividadId, agendaType: actividad.agendaType });
    }
    // Validar que el bloque existe y pertenece a la actividad
    const bloque = await Bloque.findOne({
        where: {
            id: bloqueId,
            actividadId,
            areaId: organizationId,
        },
    });
    if (!bloque) {
        throw new NotFoundError('Bloque', { bloqueId, actividadId, organizationId });
    }
    // Convertir fecha a string
    const dateStr = typeof date === 'string' ? date : toDateOnlyDB(date);
    if (!dateStr) {
        throw new ValidationError('La fecha proporcionada no es válida');
    }
    // Buscar capacidad para la actividad y fecha
    const capacidad = await Capacidad.findOne({
        where: {
            actividadId,
            date: dateStr,
            areaId: organizationId,
        },
    });
    // Si no existe capacidad, usar el capacity del bloque como límite
    const limite = capacidad ? capacidad.limit : bloque.capacity;
    // Calcular capacidad usada para este bloque específico
    const capacidadUsada = await calcularCapacidadUsada(actividadId, dateStr, organizationId, bloqueId);
    // Calcular capacidad disponible
    const capacidadDisponible = Math.max(0, limite - capacidadUsada);
    // Verificar si hay disponibilidad para la cantidad solicitada
    const disponible = capacidadDisponible >= cantidad;
    return {
        disponible,
        capacidadTotal: limite,
        capacidadUsada,
        capacidadDisponible,
        limite,
    };
};
/**
 * Verifica disponibilidad de capacidad para un día completo (actividades HORARIO_LIBRE).
 *
 * @param actividadId - ID de la actividad
 * @param date - Fecha (DateTime o string YYYY-MM-DD)
 * @param cantidad - Cantidad de personas/operaciones a verificar (default: 1)
 * @param organizationId - ID de la organización (multi-tenant)
 * @returns Resultado de disponibilidad
 * @throws {NotFoundError} Si la actividad no existe o no hay capacidad definida
 * @throws {ValidationError} Si la actividad no tiene tipo HORARIO_LIBRE
 */
export const verificarDisponibilidadPorDia = async (actividadId, date, cantidad, organizationId) => {
    // Validar que la actividad existe y tiene tipo HORARIO_LIBRE
    const actividad = await Actividad.findOne({
        where: {
            id: actividadId,
            areaId: organizationId,
        },
    });
    if (!actividad) {
        throw new NotFoundError('Actividad', { actividadId, organizationId });
    }
    if (actividad.agendaType !== 'HORARIO_LIBRE') {
        throw new ValidationError('Esta función solo aplica para actividades con tipo de agenda HORARIO_LIBRE', undefined, { actividadId, agendaType: actividad.agendaType });
    }
    // Convertir fecha a string
    const dateStr = typeof date === 'string' ? date : toDateOnlyDB(date);
    if (!dateStr) {
        throw new ValidationError('La fecha proporcionada no es válida');
    }
    // Buscar capacidad para la actividad y fecha
    const capacidad = await Capacidad.findOne({
        where: {
            actividadId,
            date: dateStr,
            areaId: organizationId,
        },
    });
    // Para HORARIO_LIBRE, la capacidad debe existir
    if (!capacidad) {
        throw new NotFoundError('Capacidad', {
            actividadId,
            date: dateStr,
            organizationId,
            message: 'No existe una capacidad definida para esta actividad y fecha. Debe crearse primero.',
        });
    }
    // Calcular capacidad usada para el día completo
    const capacidadUsada = await calcularCapacidadUsada(actividadId, dateStr, organizationId, null);
    // Calcular capacidad disponible
    const capacidadDisponible = Math.max(0, capacidad.limit - capacidadUsada);
    // Verificar si hay disponibilidad para la cantidad solicitada
    const disponible = capacidadDisponible >= cantidad;
    return {
        disponible,
        capacidadTotal: capacidad.limit,
        capacidadUsada,
        capacidadDisponible,
        limite: capacidad.limit,
    };
};
/**
 * Helper interno: Calcula y retorna la capacidad usada para una actividad, fecha y bloque (opcional).
 * Esta función puede ser usada por otros servicios (ej: al crear eventos) para verificar disponibilidad.
 *
 * @param actividadId - ID de la actividad
 * @param date - Fecha en formato YYYY-MM-DD
 * @param organizationId - ID de la organización (multi-tenant)
 * @param bloqueId - ID del bloque (opcional, solo para BLOQUES)
 * @returns Capacidad usada calculada
 */
export const actualizarCapacidadUsada = async (actividadId, date, organizationId, bloqueId) => {
    return await calcularCapacidadUsada(actividadId, date, organizationId, bloqueId);
};
//# sourceMappingURL=capacidad.service.js.map