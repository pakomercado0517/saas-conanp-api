import { Activo } from '../../../modules/activos/models/activo.model.js';
import { PrestadorProfile } from '../../../modules/prestadores/models/prestador-profile.model.js';
import { User } from '../../../modules/users/models/user.model.js';
import { Organization } from '../../../modules/organizations/models/organization.model.js';
import { NotFoundError, ValidationError } from '../../../shared/errors/index.js';
import { logger } from '../../../shared/logger/index.js';
import { assertCanAccessOrganization } from '../../../modules/organizations/services/organization.service.js';
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
export const validateEstadoTransition = (currentStatus, newStatus) => {
    const transicionesValidas = {
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
export const validateActivoAprobado = async (activoId, organizationId) => {
    // Nota: deletedAt no está en el tipo del modelo, se usa type assertion
    const activo = await Activo.findOne({
        where: {
            id: activoId,
            organizationId,
            deletedAt: null,
        },
    });
    if (!activo) {
        throw new NotFoundError('Activo', { activoId, organizationId });
    }
    if (activo.status !== 'aprobado') {
        throw new ValidationError('Solo los activos aprobados pueden usarse', undefined, {
            activoId,
            status: activo.status,
            organizationId,
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
export const createActivo = async (data, organizationId, creatorUserId) => {
    // Validar acceso a la organización
    await assertCanAccessOrganization(creatorUserId, organizationId);
    // Validar que el organizationId del data coincida con el parámetro (consistencia multi-tenant)
    if (data.organizationId !== organizationId) {
        throw new ValidationError('El ID de organización en los datos no coincide con el parámetro', undefined, {
            dataOrganizationId: data.organizationId,
            parameterOrganizationId: organizationId,
        });
    }
    // Validar que el prestador existe y pertenece a la organización
    const prestador = await PrestadorProfile.findOne({
        where: {
            id: data.ownerId,
            organizationId,
        },
    });
    if (!prestador) {
        throw new NotFoundError('Prestador', {
            ownerId: data.ownerId,
            organizationId,
        });
    }
    // Crear el activo
    const activo = await Activo.create({
        organizationId: data.organizationId,
        ownerId: data.ownerId,
        type: data.type,
        status: data.status ?? 'pendiente',
    });
    // Cargar relaciones para retornar datos completos
    await activo.reload({
        include: [
            { model: Organization, as: 'Organization' },
            { model: PrestadorProfile, as: 'Owner' },
        ],
    });
    logger.info({
        activoId: activo.id,
        organizationId: activo.organizationId,
        ownerId: activo.ownerId,
        type: activo.type,
        status: activo.status,
        creatorUserId,
    }, 'Activo creado exitosamente');
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
export const getActivoById = async (activoId, organizationId, requestingUserId) => {
    // Validar acceso a la organización
    await assertCanAccessOrganization(requestingUserId, organizationId);
    // Buscar activo con filtro multi-tenant y excluir eliminados
    // Nota: deletedAt no está en el tipo del modelo, se usa type assertion
    const activo = await Activo.findOne({
        where: {
            id: activoId,
            organizationId,
            deletedAt: null,
        },
        include: [
            { model: Organization, as: 'Organization' },
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
export const listActivos = async (organizationId, filters, requestingUserId) => {
    // Validar acceso a la organización
    await assertCanAccessOrganization(requestingUserId, organizationId);
    // Construir query con filtros multi-tenant obligatorio
    // Nota: deletedAt no está en el tipo del modelo, se incluye en Record<string, unknown>
    const where = {
        organizationId, // Multi-tenant obligatorio
        deletedAt: null, // Excluir eliminados
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
                model: Organization,
                as: 'Organization',
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
export const updateActivoStatus = async (activoId, organizationId, newStatus, requestingUserId) => {
    // Validar acceso a la organización
    await assertCanAccessOrganization(requestingUserId, organizationId);
    // Buscar activo con filtro multi-tenant y excluir eliminados
    // Nota: deletedAt no está en el tipo del modelo, se usa type assertion
    const activo = await Activo.findOne({
        where: {
            id: activoId,
            organizationId,
            deletedAt: null,
        },
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
            { model: Organization, as: 'Organization' },
            { model: PrestadorProfile, as: 'Owner' },
        ],
    });
    logger.info({
        activoId: activo.id,
        organizationId,
        previousStatus,
        newStatus,
        requestingUserId,
    }, 'Estado de activo actualizado exitosamente');
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
export const updateActivo = async (activoId, organizationId, data, requestingUserId) => {
    // Validar acceso a la organización
    await assertCanAccessOrganization(requestingUserId, organizationId);
    // Buscar activo con filtro multi-tenant y excluir eliminados
    // Nota: deletedAt no está en el tipo del modelo, se usa type assertion
    const activo = await Activo.findOne({
        where: {
            id: activoId,
            organizationId,
            deletedAt: null,
        },
    });
    if (!activo) {
        throw new NotFoundError('Activo', { activoId, organizationId });
    }
    // Preparar datos de actualización
    const updateData = {};
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
            { model: Organization, as: 'Organization' },
            { model: PrestadorProfile, as: 'Owner' },
        ],
    });
    const updatedKeys = [
        data.type !== undefined && 'type',
        data.status !== undefined && 'status',
    ].filter(Boolean);
    logger.info({
        activoId: activo.id,
        organizationId,
        updatedFields: updatedKeys,
        requestingUserId,
    }, 'Activo actualizado exitosamente');
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
export const deleteActivo = async (activoId, organizationId, requestingUserId) => {
    // Validar acceso a la organización
    await assertCanAccessOrganization(requestingUserId, organizationId);
    // Buscar activo con filtro multi-tenant y excluir eliminados
    // Nota: deletedAt no está en el tipo del modelo, se usa type assertion
    const activo = await Activo.findOne({
        where: {
            id: activoId,
            organizationId,
            deletedAt: null,
        },
    });
    if (!activo) {
        throw new NotFoundError('Activo', { activoId, organizationId });
    }
    // Realizar soft delete manual
    // Nota: El modelo no tiene paranoid: true, por lo que se usa soft delete manual
    // Se asume que el campo deletedAt existe en la tabla (puede requerir migración)
    await activo.update({ deletedAt: new Date() });
    logger.info({
        activoId,
        organizationId,
        requestingUserId,
    }, 'Activo eliminado exitosamente (soft delete)');
};
//# sourceMappingURL=activo.service.js.map