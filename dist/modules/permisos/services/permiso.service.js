import { Op } from 'sequelize';
import { Permiso } from '../../../modules/permisos/models/permiso.model.js';
import { PrestadorProfile } from '../../../modules/prestadores/models/prestador-profile.model.js';
import { Actividad } from '../../../modules/actividades/models/actividad.model.js';
import { NotFoundError, ValidationError } from '../../../shared/errors/index.js';
import { logger } from '../../../shared/logger/index.js';
import { assertCanAccessOrganization } from '../../../modules/organizations/services/organization.service.js';
import { now, isWithinValidityRange, DateTime, fromJSDate } from '../../../shared/dates/index.js';
/**
 * Valida que las fechas de vigencia sean correctas.
 *
 * @param validFrom - Fecha de inicio
 * @param validTo - Fecha de fin
 * @throws {ValidationError} Si las fechas no son válidas
 */
export const validateFechasVigencia = (validFrom, validTo) => {
    const from = validFrom instanceof Date ? fromJSDate(validFrom) : validFrom;
    const to = validTo instanceof Date ? fromJSDate(validTo) : validTo;
    if (!from || !from.isValid || !to || !to.isValid) {
        throw new ValidationError('Las fechas de vigencia deben ser válidas');
    }
    if (to <= from) {
        throw new ValidationError('La fecha de fin (validTo) debe ser posterior a la fecha de inicio (validFrom)', undefined, {
            validFrom: from.toISO(),
            validTo: to.toISO(),
        });
    }
};
/**
 * Verifica si un permiso está vigente en una fecha específica (o fecha actual).
 *
 * @param permiso - El permiso a verificar
 * @param date - Fecha a verificar (opcional, default: fecha actual)
 * @returns true si el permiso está vigente, false en caso contrario
 */
export const isPermisoVigente = (permiso, date) => {
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
 *
 * @param prestadorId - ID del prestador
 * @param actividadId - ID de la actividad
 * @param organizationId - ID de la organización (multi-tenant)
 * @param date - Fecha a verificar (opcional, default: fecha actual)
 * @returns Permiso vigente o null si no existe
 * @throws {ValidationError} Si el prestador o actividad no pertenecen a la organización
 */
export const validatePrestadorHasPermisoVigente = async (prestadorId, actividadId, organizationId, date) => {
    // Verificar que el prestador existe y pertenece a la organización
    const prestador = await PrestadorProfile.findOne({
        where: {
            id: prestadorId,
            organizationId,
        },
    });
    if (!prestador) {
        throw new ValidationError('El prestador no existe o no pertenece a esta organización', undefined, {
            prestadorId,
            organizationId,
        });
    }
    // Verificar que la actividad existe y pertenece a la organización
    const actividad = await Actividad.findOne({
        where: {
            id: actividadId,
            organizationId,
        },
    });
    if (!actividad) {
        throw new ValidationError('La actividad no existe o no pertenece a esta organización', undefined, {
            actividadId,
            organizationId,
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
 */
export const createPermiso = async (data, organizationId, creatorUserId) => {
    // Validar acceso a la organización
    await assertCanAccessOrganization(creatorUserId, organizationId);
    // Validar que el prestador existe y pertenece a la organización
    const prestador = await PrestadorProfile.findOne({
        where: {
            id: data.prestadorId,
            organizationId,
        },
    });
    if (!prestador) {
        throw new NotFoundError('Prestador', {
            prestadorId: data.prestadorId,
            organizationId,
        });
    }
    // Validar que la actividad existe y pertenece a la organización
    const actividad = await Actividad.findOne({
        where: {
            id: data.actividadId,
            organizationId,
        },
    });
    if (!actividad) {
        throw new NotFoundError('Actividad', {
            actividadId: data.actividadId,
            organizationId,
        });
    }
    // Validar que el prestador y la actividad pertenecen a la misma organización
    if (prestador.organizationId !== actividad.organizationId) {
        throw new ValidationError('El prestador y la actividad deben pertenecer a la misma organización', undefined, {
            prestadorOrganizationId: prestador.organizationId,
            actividadOrganizationId: actividad.organizationId,
        });
    }
    // Convertir fechas DateTime a Date para guardar en BD
    const validFromDate = data.validFrom.toJSDate();
    const validToDate = data.validTo.toJSDate();
    // Validar fechas de vigencia (aunque ya están validadas en el schema, validar nuevamente por seguridad)
    validateFechasVigencia(data.validFrom, data.validTo);
    // Crear el permiso
    let permiso;
    try {
        permiso = await Permiso.create({
            prestadorId: data.prestadorId,
            actividadId: data.actividadId,
            validFrom: validFromDate,
            validTo: validToDate,
            status: data.status ?? 'activo',
            documentUrl: data.documentUrl ?? null,
        });
    }
    catch (error) {
        // Capturar errores de constraint único
        if (error instanceof Error &&
            'name' in error &&
            error.name === 'SequelizeUniqueConstraintError') {
            throw new ValidationError('Ya existe un permiso para este prestador y actividad', undefined, {
                prestadorId: data.prestadorId,
                actividadId: data.actividadId,
            });
        }
        throw error;
    }
    // Cargar relaciones para retornar datos completos
    await permiso.reload({
        include: [
            { model: PrestadorProfile, as: 'PrestadorProfile' },
            { model: Actividad, as: 'Actividad' },
        ],
    });
    logger.info({
        permisoId: permiso.id,
        prestadorId: permiso.prestadorId,
        actividadId: permiso.actividadId,
        organizationId,
        status: permiso.status,
        creatorUserId,
    }, 'Permiso creado exitosamente');
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
export const getPermisoById = async (permisoId, organizationId, requestingUserId) => {
    // Validar acceso a la organización
    await assertCanAccessOrganization(requestingUserId, organizationId);
    // Buscar permiso con filtro multi-tenant
    // Necesitamos verificar que el prestador o la actividad pertenezcan a la organización
    const permiso = await Permiso.findOne({
        where: {
            id: permisoId,
        },
        include: [
            {
                model: PrestadorProfile,
                as: 'PrestadorProfile',
                where: {
                    organizationId,
                },
                required: true,
            },
            { model: Actividad, as: 'Actividad' },
        ],
    });
    if (!permiso) {
        throw new NotFoundError('Permiso', { permisoId, organizationId });
    }
    // Verificar que la actividad también pertenece a la organización
    if (permiso.Actividad && permiso.Actividad.organizationId !== organizationId) {
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
export const listPermisosByPrestador = async (prestadorId, organizationId, filters, requestingUserId) => {
    // Validar acceso a la organización
    await assertCanAccessOrganization(requestingUserId, organizationId);
    // Validar que el prestador existe y pertenece a la organización
    const prestador = await PrestadorProfile.findOne({
        where: {
            id: prestadorId,
            organizationId,
        },
    });
    if (!prestador) {
        throw new NotFoundError('Prestador', { prestadorId, organizationId });
    }
    // Construir query con filtros multi-tenant obligatorio
    const where = {
        prestadorId,
    };
    // Aplicar filtros opcionales
    if (filters.actividadId) {
        where['actividadId'] = filters.actividadId;
    }
    if (filters.status) {
        where['status'] = filters.status;
    }
    if (filters.validFrom) {
        const validFromDate = filters.validFrom && typeof filters.validFrom === 'object' && 'toJSDate' in filters.validFrom
            ? filters.validFrom.toJSDate()
            : filters.validFrom;
        where['validFrom'] = {
            [Op.gte]: validFromDate,
        };
    }
    if (filters.validTo) {
        const validToDate = filters.validTo && typeof filters.validTo === 'object' && 'toJSDate' in filters.validTo
            ? filters.validTo.toJSDate()
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
    // Configurar paginación
    const limit = filters.limit;
    const sortBy = filters.sortBy ?? 'createdAt';
    const sortOrder = filters.sortOrder ?? 'desc';
    const offset = (filters.page - 1) * limit;
    // Ejecutar query con paginación
    // Asegurar que solo se obtengan permisos de prestadores y actividades de la organización
    const result = await Permiso.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sortBy, sortOrder]],
        include: [
            {
                model: PrestadorProfile,
                as: 'PrestadorProfile',
                where: {
                    organizationId,
                },
                required: true,
            },
            {
                model: Actividad,
                as: 'Actividad',
                where: {
                    organizationId,
                },
                required: true,
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
export const updatePermiso = async (permisoId, organizationId, data, requestingUserId) => {
    // Validar acceso a la organización
    await assertCanAccessOrganization(requestingUserId, organizationId);
    // Buscar permiso con filtro multi-tenant
    const permiso = await Permiso.findOne({
        where: {
            id: permisoId,
        },
        include: [
            {
                model: PrestadorProfile,
                as: 'PrestadorProfile',
                where: {
                    organizationId,
                },
                required: true,
            },
            { model: Actividad, as: 'Actividad' },
        ],
    });
    if (!permiso) {
        throw new NotFoundError('Permiso', { permisoId, organizationId });
    }
    // Verificar que la actividad también pertenece a la organización
    if (permiso.Actividad && permiso.Actividad.organizationId !== organizationId) {
        throw new NotFoundError('Permiso', { permisoId, organizationId });
    }
    // Preparar datos de actualización
    const updateData = {};
    // Convertir fechas DateTime a Date si se actualizan
    // Nota: validFrom y validTo no pueden ser null en el modelo, solo se actualizan si vienen con valor
    if (data.validFrom !== undefined && data.validFrom !== null) {
        if (typeof data.validFrom === 'object' && 'toJSDate' in data.validFrom) {
            updateData.validFrom = data.validFrom.toJSDate();
        }
    }
    if (data.validTo !== undefined && data.validTo !== null) {
        if (typeof data.validTo === 'object' && 'toJSDate' in data.validTo) {
            updateData.validTo = data.validTo.toJSDate();
        }
    }
    // Validar fechas de vigencia si ambas están presentes
    if (updateData.validFrom && updateData.validTo) {
        const validFrom = fromJSDate(updateData.validFrom);
        const validTo = fromJSDate(updateData.validTo);
        validateFechasVigencia(validFrom, validTo);
    }
    else if (updateData.validFrom || updateData.validTo) {
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
    ].filter(Boolean);
    logger.info({
        permisoId: permiso.id,
        organizationId,
        updatedFields: updatedKeys,
        requestingUserId,
    }, 'Permiso actualizado exitosamente');
    return permiso;
};
//# sourceMappingURL=permiso.service.js.map