import { Op } from 'sequelize';
import { Bloque } from '../../../modules/actividades/models/bloque.model.js';
import { Actividad } from '../../../modules/actividades/models/actividad.model.js';
import { NotFoundError, ValidationError } from '../../../shared/errors/index.js';
import { logger } from '../../../shared/logger/index.js';
import { assertCanAccessOrganization } from '../../../modules/organizations/services/organization.service.js';
import { assertIsAdmin } from '../../../modules/users/services/membership.service.js';
import { toDateOnlyDB, toTimeOnly, parseTimeOnly, parseDateOnly, doTimeRangesOverlap, DateTime, } from '../../../shared/dates/index.js';
/**
 * Valida que una actividad tenga tipo de agenda BLOQUES
 *
 * @param actividadId - ID de la actividad
 * @param organizationId - ID de la organización (multi-tenant)
 * @throws {NotFoundError} Si la actividad no existe
 * @throws {ValidationError} Si la actividad no tiene tipo BLOQUES
 */
const validateActividadHasBloquesType = async (actividadId, organizationId) => {
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
        throw new ValidationError('Solo las actividades con tipo de agenda BLOQUES pueden tener bloques', undefined, { actividadId, agendaType: actividad.agendaType });
    }
};
/**
 * Valida que un bloque no se solape con otros bloques existentes
 *
 * @param actividadId - ID de la actividad
 * @param date - Fecha del bloque (string YYYY-MM-DD o DateTime)
 * @param startTime - Hora de inicio (string HH:mm:ss o DateTime)
 * @param endTime - Hora de fin (string HH:mm:ss o DateTime)
 * @param organizationId - ID de la organización (multi-tenant)
 * @param excludeBloqueId - ID del bloque a excluir de la validación (para updates)
 * @throws {ValidationError} Si hay solapamiento con otro bloque
 */
const validateNoTimeOverlap = async (actividadId, date, startTime, endTime, organizationId, excludeBloqueId) => {
    // Solo validar solapamiento para bloques con fecha específica (no plantillas)
    if (!date) {
        return;
    }
    // Convertir date a string si es DateTime
    const dateStr = typeof date === 'string' ? date : toDateOnlyDB(date);
    if (!dateStr) {
        return;
    }
    // Buscar bloques existentes para la misma fecha y actividad
    const whereClause = {
        actividadId,
        areaId: organizationId,
        date: dateStr,
        isTemplate: false, // Solo validar solapamiento con bloques no plantilla
    };
    if (excludeBloqueId) {
        whereClause['id'] = { [Op.ne]: excludeBloqueId };
    }
    const existingBloques = await Bloque.findAll({
        where: whereClause,
    });
    // Convertir startTime y endTime a DateTime para comparación
    let startTimeDt = null;
    let endTimeDt = null;
    if (typeof startTime === 'string') {
        startTimeDt = parseTimeOnly(startTime, parseDateOnly(dateStr) || undefined);
    }
    else {
        startTimeDt = startTime;
    }
    if (typeof endTime === 'string') {
        endTimeDt = parseTimeOnly(endTime, parseDateOnly(dateStr) || undefined);
    }
    else {
        endTimeDt = endTime;
    }
    if (!startTimeDt || !startTimeDt.isValid || !endTimeDt || !endTimeDt.isValid) {
        throw new ValidationError('Los horarios proporcionados no son válidos');
    }
    // Verificar solapamiento con cada bloque existente
    for (const existingBloque of existingBloques) {
        const existingStartTime = parseTimeOnly(existingBloque.startTime, parseDateOnly(existingBloque.date || '') || undefined);
        const existingEndTime = parseTimeOnly(existingBloque.endTime, parseDateOnly(existingBloque.date || '') || undefined);
        if (!existingStartTime ||
            !existingStartTime.isValid ||
            !existingEndTime ||
            !existingEndTime.isValid) {
            continue;
        }
        if (doTimeRangesOverlap(startTimeDt, endTimeDt, existingStartTime, existingEndTime)) {
            throw new ValidationError(`El bloque se solapa con otro bloque existente (${existingBloque.startTime} - ${existingBloque.endTime})`, undefined, {
                conflictedBloqueId: existingBloque.id,
                conflictedStartTime: existingBloque.startTime,
                conflictedEndTime: existingBloque.endTime,
            });
        }
    }
};
/**
 * Obtiene todas las plantillas de bloques para una actividad
 *
 * @param actividadId - ID de la actividad
 * @param organizationId - ID de la organización (multi-tenant)
 * @returns Array de bloques plantilla
 */
export const getBloquesTemplates = async (actividadId, organizationId) => {
    return await Bloque.findAll({
        where: {
            actividadId,
            areaId: organizationId,
            isTemplate: true,
        },
        order: [['startTime', 'ASC']],
    });
};
/**
 * Crea un nuevo bloque.
 * Solo los administradores pueden crear bloques.
 *
 * @param data - Datos del bloque
 * @param userId - ID del usuario que crea (debe ser admin)
 * @returns Bloque creado
 * @throws {ForbiddenError} Si no es admin
 * @throws {NotFoundError} Si la actividad no existe
 * @throws {ValidationError} Si la actividad no tiene tipo BLOQUES o hay solapamiento
 */
export const createBloque = async (data, userId) => {
    // Validar que el usuario sea admin
    await assertIsAdmin(userId, data.organizationId);
    // Validar acceso a la organización
    await assertCanAccessOrganization(userId, data.organizationId);
    // Validar que la actividad tenga tipo BLOQUES
    await validateActividadHasBloquesType(data.actividadId, data.organizationId);
    // Convertir fechas/horas de DateTime a strings para BD
    const dateStr = data['date'] ? toDateOnlyDB(data['date']) : null;
    const startTimeStr = toTimeOnly(data['startTime']);
    const endTimeStr = toTimeOnly(data['endTime']);
    if (!startTimeStr || !endTimeStr) {
        throw new ValidationError('Los horarios proporcionados no son válidos');
    }
    // Validar que no haya solapamiento (solo para bloques no plantilla)
    if (!data['isTemplate'] && dateStr) {
        await validateNoTimeOverlap(data.actividadId, dateStr, startTimeStr, endTimeStr, data.organizationId);
    }
    // Crear el bloque
    const bloque = await Bloque.create({
        areaId: data.organizationId,
        actividadId: data.actividadId,
        date: dateStr,
        startTime: startTimeStr,
        endTime: endTimeStr,
        capacity: data.capacity ?? 1,
        isTemplate: data.isTemplate ?? false,
    });
    logger.info({
        bloqueId: bloque.id,
        organizationId: bloque.areaId,
        actividadId: bloque.actividadId,
        date: bloque.date,
        startTime: bloque.startTime,
        endTime: bloque.endTime,
        isTemplate: bloque.isTemplate,
        userId,
    }, 'Bloque creado exitosamente');
    return bloque;
};
/**
 * Crea un bloque desde una plantilla.
 * Solo los administradores pueden crear bloques desde plantillas.
 *
 * @param data - Datos para crear desde plantilla
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que crea (debe ser admin)
 * @returns Bloque creado
 * @throws {ForbiddenError} Si no es admin
 * @throws {NotFoundError} Si la plantilla no existe
 * @throws {ValidationError} Si hay solapamiento
 */
export const createBloqueFromTemplate = async (data, organizationId, userId) => {
    // Validar que el usuario sea admin
    await assertIsAdmin(userId, organizationId);
    // Validar acceso a la organización
    await assertCanAccessOrganization(userId, organizationId);
    // Buscar la plantilla
    const template = await Bloque.findOne({
        where: {
            id: data.templateId,
            areaId: organizationId,
            isTemplate: true,
        },
        include: [
            {
                model: Actividad,
                as: 'Actividad',
                required: true,
            },
        ],
    });
    if (!template) {
        throw new NotFoundError('Plantilla de bloque', { templateId: data.templateId, organizationId });
    }
    // Validar que la actividad tenga tipo BLOQUES
    if (template.Actividad && template.Actividad.agendaType !== 'BLOQUES') {
        throw new ValidationError('La plantilla pertenece a una actividad que no tiene tipo de agenda BLOQUES', undefined, {
            actividadId: template.actividadId,
            agendaType: template.Actividad.agendaType,
        });
    }
    // Convertir fecha a string
    const dateStr = toDateOnlyDB(data['date']);
    if (!dateStr) {
        throw new ValidationError('La fecha proporcionada no es válida');
    }
    // Validar que no haya solapamiento
    await validateNoTimeOverlap(template.actividadId, dateStr, template.startTime, template.endTime, organizationId);
    // Crear el bloque desde la plantilla
    const bloque = await Bloque.create({
        areaId: template.areaId,
        actividadId: template.actividadId,
        date: dateStr,
        startTime: template.startTime,
        endTime: template.endTime,
        capacity: data.capacity ?? template.capacity,
        isTemplate: false,
    });
    logger.info({
        bloqueId: bloque.id,
        templateId: data.templateId,
        organizationId: bloque.areaId,
        actividadId: bloque.actividadId,
        date: bloque.date,
        userId,
    }, 'Bloque creado desde plantilla exitosamente');
    return bloque;
};
/**
 * Obtiene un bloque por ID.
 * Cualquier usuario con acceso a la organización puede leer bloques.
 *
 * @param bloqueId - ID del bloque
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que solicita
 * @returns Bloque encontrado
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si el bloque no existe o no pertenece a la organización
 */
export const getBloqueById = async (bloqueId, organizationId, userId) => {
    // Validar acceso a la organización
    await assertCanAccessOrganization(userId, organizationId);
    // Buscar bloque con filtro multi-tenant
    const bloque = await Bloque.findOne({
        where: {
            id: bloqueId,
            areaId: organizationId, // Multi-tenant obligatorio (organizationId = areaId en API)
        },
        include: [
            {
                model: Actividad,
                as: 'Actividad',
                required: false,
            },
        ],
    });
    if (!bloque) {
        throw new NotFoundError('Bloque', { bloqueId, organizationId });
    }
    return bloque;
};
/**
 * Lista bloques de una actividad específica.
 * Cualquier usuario con acceso a la organización puede listar bloques.
 *
 * @param actividadId - ID de la actividad
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros de paginación y búsqueda
 * @param userId - ID del usuario que solicita
 * @returns Datos paginados de bloques
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {NotFoundError} Si la actividad no existe
 */
export const listBloquesByActividad = async (actividadId, organizationId, filters, userId) => {
    // Validar acceso a la organización
    await assertCanAccessOrganization(userId, organizationId);
    // Validar que la actividad exista
    const actividad = await Actividad.findOne({
        where: {
            id: actividadId,
            areaId: organizationId,
        },
    });
    if (!actividad) {
        throw new NotFoundError('Actividad', { actividadId, organizationId });
    }
    // Construir query con filtros multi-tenant obligatorio
    const where = {
        actividadId,
        areaId: organizationId, // Multi-tenant obligatorio
    };
    // Aplicar filtros opcionales
    if (filters['date']) {
        const dateStr = typeof filters['date'] === 'string' ? filters['date'] : toDateOnlyDB(filters['date']);
        if (dateStr) {
            where['date'] = dateStr;
        }
    }
    if (filters['isTemplate'] !== undefined) {
        where['isTemplate'] = filters['isTemplate'];
    }
    // Configurar paginación
    const limit = filters['limit'];
    const sortBy = filters['sortBy'] ?? 'createdAt';
    const sortOrder = filters['sortOrder'] ?? 'desc';
    const offset = (filters['page'] - 1) * limit;
    // Ejecutar query con paginación
    const result = await Bloque.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sortBy, sortOrder]],
    });
    const total = result.count;
    const totalPages = Math.ceil(total / limit);
    const pagination = {
        page: filters['page'],
        limit,
        total,
        totalPages,
    };
    return { data: result.rows, pagination };
};
/**
 * Lista bloques con paginación y filtros.
 * Cualquier usuario con acceso a la organización puede listar bloques.
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros de paginación y búsqueda
 * @param userId - ID del usuario que solicita
 * @returns Datos paginados de bloques
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 */
export const listBloques = async (organizationId, filters, userId) => {
    // Validar acceso a la organización
    await assertCanAccessOrganization(userId, organizationId);
    // Construir query con filtros multi-tenant obligatorio
    const where = {
        areaId: organizationId, // Multi-tenant obligatorio
    };
    // Aplicar filtros opcionales
    if (filters['actividadId']) {
        where['actividadId'] = filters['actividadId'];
    }
    if (filters['date']) {
        const dateStr = typeof filters['date'] === 'string' ? filters['date'] : toDateOnlyDB(filters['date']);
        if (dateStr) {
            where['date'] = dateStr;
        }
    }
    if (filters['isTemplate'] !== undefined) {
        where['isTemplate'] = filters['isTemplate'];
    }
    // Configurar paginación
    const limit = filters['limit'];
    const sortBy = filters['sortBy'] ?? 'createdAt';
    const sortOrder = filters['sortOrder'] ?? 'desc';
    const offset = (filters['page'] - 1) * limit;
    // Ejecutar query con paginación
    const result = await Bloque.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sortBy, sortOrder]],
    });
    const total = result.count;
    const totalPages = Math.ceil(total / limit);
    const pagination = {
        page: filters['page'],
        limit,
        total,
        totalPages,
    };
    return { data: result.rows, pagination };
};
/**
 * Actualiza un bloque existente.
 * Solo los administradores pueden actualizar bloques.
 *
 * @param bloqueId - ID del bloque
 * @param organizationId - ID de la organización (multi-tenant)
 * @param data - Datos a actualizar
 * @param userId - ID del usuario que actualiza (debe ser admin)
 * @returns Bloque actualizado
 * @throws {ForbiddenError} Si no es admin o no tiene acceso
 * @throws {NotFoundError} Si el bloque no existe o no pertenece a la organización
 * @throws {ValidationError} Si hay solapamiento o la actividad no tiene tipo BLOQUES
 */
export const updateBloque = async (bloqueId, organizationId, data, userId) => {
    // Validar que el usuario sea admin
    await assertIsAdmin(userId, organizationId);
    // Validar acceso a la organización
    await assertCanAccessOrganization(userId, organizationId);
    // Buscar bloque con filtro multi-tenant
    const bloque = await Bloque.findOne({
        where: {
            id: bloqueId,
            areaId: organizationId, // Multi-tenant obligatorio
        },
        include: [
            {
                model: Actividad,
                as: 'Actividad',
                required: false,
            },
        ],
    });
    if (!bloque) {
        throw new NotFoundError('Bloque', { bloqueId, organizationId });
    }
    // Si se actualiza actividadId, validar que la nueva actividad tenga tipo BLOQUES
    // Nota: UpdateBloqueDTO no incluye actividadId, así que esta validación no aplica
    // pero se mantiene por si se agrega en el futuro
    // Preparar datos de actualización
    const updateData = {};
    // Convertir y actualizar fecha si se proporciona
    let newDate = bloque.date;
    if (data['date'] !== undefined) {
        newDate = data['date'] ? toDateOnlyDB(data['date']) : null;
        updateData.date = newDate;
    }
    // Convertir y actualizar horarios si se proporcionan
    let newStartTime = bloque.startTime;
    let newEndTime = bloque.endTime;
    if (data['startTime'] !== undefined && data['startTime'] !== null) {
        const startTimeStr = toTimeOnly(data['startTime']);
        if (startTimeStr) {
            newStartTime = startTimeStr;
            updateData.startTime = startTimeStr;
        }
    }
    if (data['endTime'] !== undefined && data['endTime'] !== null) {
        const endTimeStr = toTimeOnly(data['endTime']);
        if (endTimeStr) {
            newEndTime = endTimeStr;
            updateData.endTime = endTimeStr;
        }
    }
    // Actualizar capacidad si se proporciona
    if (data['capacity'] !== undefined) {
        updateData.capacity = data['capacity'];
    }
    // Actualizar isTemplate si se proporciona
    if (data['isTemplate'] !== undefined) {
        updateData.isTemplate = data['isTemplate'];
    }
    // Validar solapamiento si se actualizan horarios o fecha (solo para bloques no plantilla)
    const finalIsTemplate = data['isTemplate'] !== undefined ? data['isTemplate'] : bloque.isTemplate;
    if (!finalIsTemplate && newDate) {
        await validateNoTimeOverlap(bloque.actividadId, newDate, newStartTime, newEndTime, organizationId, bloqueId);
    }
    // Actualizar el bloque
    await bloque.update(updateData);
    const updatedKeys = Object.keys(updateData);
    logger.info({
        bloqueId: bloque.id,
        organizationId,
        updatedFields: updatedKeys,
        userId,
    }, 'Bloque actualizado exitosamente');
    return bloque;
};
/**
 * Elimina un bloque.
 * Solo los administradores pueden eliminar bloques.
 *
 * @param bloqueId - ID del bloque
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que elimina (debe ser admin)
 * @throws {ForbiddenError} Si no es admin o no tiene acceso
 * @throws {NotFoundError} Si el bloque no existe o no pertenece a la organización
 */
export const deleteBloque = async (bloqueId, organizationId, userId) => {
    // Validar que el usuario sea admin
    await assertIsAdmin(userId, organizationId);
    // Validar acceso a la organización
    await assertCanAccessOrganization(userId, organizationId);
    // Buscar bloque con filtro multi-tenant
    const bloque = await Bloque.findOne({
        where: {
            id: bloqueId,
            areaId: organizationId, // Multi-tenant obligatorio
        },
    });
    if (!bloque) {
        throw new NotFoundError('Bloque', { bloqueId, organizationId });
    }
    // Eliminar el bloque (hard delete, ya que el modelo no tiene paranoid: true)
    await bloque.destroy();
    logger.info({
        bloqueId,
        organizationId,
        userId,
    }, 'Bloque eliminado exitosamente');
};
//# sourceMappingURL=bloque.service.js.map