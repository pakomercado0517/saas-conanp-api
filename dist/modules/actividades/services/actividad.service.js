import { Op } from 'sequelize';
import { Actividad } from '../../../modules/actividades/models/actividad.model.js';
import { NotFoundError, ValidationError } from '../../../shared/errors/index.js';
import { logger } from '../../../shared/logger/index.js';
import { assertCanAccessOrganization } from '../../../modules/organizations/services/organization.service.js';
import { assertIsAdmin } from '../../../modules/users/services/membership.service.js';
import { checkActividadesLimit } from '../../../modules/subscriptions/services/subscription-limits.service.js';
import { cache } from '../../../shared/cache/index.js';
import { CacheKeys } from '../../../shared/cache/keys.js';
import { cacheConfig } from '../../../shared/cache/config.js';
/**
 * Invalida el caché de actividades de una organización.
 * Se llama después de CREATE/UPDATE/DELETE de actividades.
 */
const invalidateActividadCache = async (organizationId, actividadId) => {
    const keys = [CacheKeys.actividades(organizationId)];
    if (actividadId) {
        keys.push(CacheKeys.actividad(organizationId, actividadId));
    }
    await cache.del(keys);
    logger.debug({ organizationId, actividadId, keys }, 'Caché de actividades invalidado');
};
/**
 * Valida que el tipo de agenda sea válido
 *
 * @param agendaType - Tipo de agenda a validar
 * @throws {ValidationError} Si el tipo de agenda no es válido
 */
const validateAgendaType = (agendaType) => {
    const validTypes = ['BLOQUES', 'HORARIO_LIBRE'];
    if (!validTypes.includes(agendaType)) {
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
export const createActividad = async (data, userId) => {
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
    // Invalidar caché después de crear actividad
    await invalidateActividadCache(data.organizationId);
    logger.info({
        actividadId: actividad.id,
        organizationId: actividad.organizationId,
        name: actividad.name,
        agendaType: actividad.agendaType,
        userId,
    }, 'Actividad creada exitosamente');
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
export const getActividadById = async (actividadId, organizationId, userId) => {
    // Validar acceso a la organización
    await assertCanAccessOrganization(userId, organizationId);
    const cacheKey = CacheKeys.actividad(organizationId, actividadId);
    // Intentar obtener del caché
    const cached = await cache.get(cacheKey);
    if (cached) {
        return cached;
    }
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
    // Guardar en caché
    await cache.set(cacheKey, actividad, cacheConfig.ttl.actividad);
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
export const listActividades = async (organizationId, filters, userId) => {
    // Validar acceso a la organización
    await assertCanAccessOrganization(userId, organizationId);
    // Construir query con filtros multi-tenant obligatorio
    // Nota: paranoid: true en el modelo excluye automáticamente registros eliminados
    const where = {
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
    const total = result.count;
    const totalPages = Math.ceil(total / limit);
    const pagination = {
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
export const updateActividad = async (actividadId, organizationId, data, userId) => {
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
    const updateData = {};
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
    // Invalidar caché después de actualizar actividad
    await invalidateActividadCache(organizationId, actividadId);
    const updatedKeys = Object.keys(updateData);
    logger.info({
        actividadId: actividad.id,
        organizationId,
        updatedFields: updatedKeys,
        userId,
    }, 'Actividad actualizada exitosamente');
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
export const deleteActividad = async (actividadId, organizationId, userId) => {
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
    // Invalidar caché después de eliminar actividad
    await invalidateActividadCache(organizationId, actividadId);
    logger.info({
        actividadId,
        organizationId,
        userId,
    }, 'Actividad eliminada exitosamente (soft delete)');
};
//# sourceMappingURL=actividad.service.js.map