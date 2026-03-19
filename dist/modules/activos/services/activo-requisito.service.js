import { Area } from '../../../modules/areas/models/area.model.js';
import { ActivoRequisito } from '../../../modules/activos/models/activo-requisito.model.js';
import { Activo } from '../../../modules/activos/models/activo.model.js';
import { NotFoundError, ValidationError } from '../../../shared/errors/index.js';
import { logger } from '../../../shared/logger/index.js';
import { assertCanAccessOrganization } from '../../../modules/organizations/services/organization.service.js';
import { getActivoById } from '../../../modules/activos/services/activo.service.js';
import { getCatalogoForActivo } from '../../../modules/activos/services/activo-requisito-catalogo.service.js';
/** Resuelve areaId (organizationId en API) a dependenciaId. Activos son por dependencia. */
const getDependenciaIdFromAreaId = async (areaId) => {
    const area = await Area.findByPk(areaId);
    if (!area)
        throw new NotFoundError('��rea', { areaId });
    return area.dependenciaId;
};
/**
 * Valida value y documentUrl seg?n la definici?n del cat?logo.
 * Lanza ValidationError si no cumple requerido, requiereDocumento o tipoDato.
 */
function validateRequisitoAgainstCatalogo(def, value, documentUrl, context) {
    const val = value ?? null;
    const empty = val === null || String(val).trim() === '';
    if (def.requerido && empty) {
        throw new ValidationError(`El requisito "${def.label || def.key}" es obligatorio`, undefined, context);
    }
    if (def.requiereDocumento) {
        const url = documentUrl ?? null;
        if (url === null || String(url).trim() === '') {
            throw new ValidationError(`El requisito "${def.label || def.key}" requiere un documento (URL)`, undefined, context);
        }
    }
    if (!empty && def.tipoDato === 'date') {
        const parsed = Date.parse(val);
        if (Number.isNaN(parsed)) {
            throw new ValidationError(`El valor de "${def.label || def.key}" debe ser una fecha v?lida (formato ISO)`, undefined, context);
        }
    }
    if (!empty && def.tipoDato === 'number') {
        const n = Number(val);
        if (Number.isNaN(n) || !Number.isFinite(n)) {
            throw new ValidationError(`El valor de "${def.label || def.key}" debe ser un n?mero`, undefined, context);
        }
    }
}
/**
 * Crea un requisito de activo.
 *
 * @param data - Datos del requisito
 * @param organizationId - ID de la organizaci?n (multi-tenant)
 * @param requestingUserId - ID del usuario que crea
 * @returns ActivoRequisito creado con relaci?n Activo cargada
 * @throws {ForbiddenError} Si no tiene acceso a la organizaci?n
 * @throws {NotFoundError} Si el activo no existe o no pertenece a la organizaci?n
 * @throws {ValidationError} Si ya existe un requisito con la misma clave para el activo
 */
export const createRequisito = async (data, organizationId, requestingUserId) => {
    await assertCanAccessOrganization(requestingUserId, organizationId);
    const activo = await getActivoById(data.activoId, organizationId, requestingUserId);
    const catalogo = await getCatalogoForActivo(activo.dependenciaId, activo.type);
    const def = catalogo.find((c) => c.key === data.key);
    if (!def) {
        throw new ValidationError('La clave del requisito no est? permitida para este tipo de activo en esta dependencia. Use el cat?logo de requisitos para ver las claves v?lidas.', undefined, { activoId: data.activoId, key: data.key, tipoActivo: activo.type });
    }
    validateRequisitoAgainstCatalogo(def, data.value, data.documentUrl, { key: data.key });
    let requisito;
    try {
        requisito = await ActivoRequisito.create({
            activoId: data.activoId,
            key: data.key,
            value: data.value ?? null,
            documentUrl: data.documentUrl ?? null,
            validated: data.validated ?? false,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            'name' in error &&
            error.name === 'SequelizeUniqueConstraintError') {
            throw new ValidationError('Ya existe un requisito con esta clave para este activo', undefined, { activoId: data.activoId, key: data.key });
        }
        throw error;
    }
    await requisito.reload({ include: [{ model: Activo, as: 'Activo' }] });
    logger.info({
        requisitoId: requisito.id,
        activoId: requisito.activoId,
        key: requisito.key,
        organizationId,
        requestingUserId,
    }, 'Requisito de activo creado exitosamente');
    return requisito;
};
/**
 * Lista requisitos de un activo con paginaci?n y filtros.
 *
 * @param activoId - ID del activo
 * @param organizationId - ID de la organizaci?n (multi-tenant)
 * @param filters - Filtros de paginaci?n y b?squeda
 * @param requestingUserId - ID del usuario que solicita
 * @returns Datos paginados de requisitos con relaci?n Activo cargada
 * @throws {ForbiddenError} Si no tiene acceso a la organizaci?n
 * @throws {NotFoundError} Si el activo no existe o no pertenece a la organizaci?n
 */
export const listRequisitosByActivo = async (activoId, organizationId, filters, requestingUserId) => {
    await assertCanAccessOrganization(requestingUserId, organizationId);
    await getActivoById(activoId, organizationId, requestingUserId);
    const where = { activoId };
    if (filters.validated !== undefined) {
        where['validated'] = filters.validated;
    }
    const limit = filters.limit;
    const sortBy = filters.sortBy ?? 'key';
    const sortOrder = filters.sortOrder ?? 'asc';
    const offset = (filters.page - 1) * limit;
    const result = await ActivoRequisito.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sortBy, sortOrder]],
        include: [{ model: Activo, as: 'Activo' }],
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
 * Actualiza un requisito de activo.
 * Solo se pueden actualizar value, documentUrl y validated (no key).
 *
 * @param requisitoId - ID del requisito
 * @param organizationId - ID de la organizaci?n (multi-tenant)
 * @param data - Datos a actualizar
 * @param requestingUserId - ID del usuario que actualiza
 * @returns ActivoRequisito actualizado con relaci?n Activo cargada
 * @throws {ForbiddenError} Si no tiene acceso a la organizaci?n
 * @throws {NotFoundError} Si el requisito no existe o su activo no pertenece a la organizaci?n
 */
export const updateRequisito = async (requisitoId, organizationId, data, requestingUserId) => {
    await assertCanAccessOrganization(requestingUserId, organizationId);
    const requisito = await ActivoRequisito.findOne({
        where: { id: requisitoId },
        include: [{ model: Activo, as: 'Activo' }],
    });
    const dependenciaId = await getDependenciaIdFromAreaId(organizationId);
    if (!requisito || !requisito.Activo || requisito.Activo.dependenciaId !== dependenciaId) {
        throw new NotFoundError('Requisito de activo', { requisitoId, organizationId });
    }
    const updateData = {};
    if (data.value !== undefined)
        updateData.value = data.value;
    if (data.documentUrl !== undefined)
        updateData.documentUrl = data.documentUrl;
    if (data.validated !== undefined)
        updateData.validated = data.validated;
    if (updateData.value !== undefined || updateData.documentUrl !== undefined) {
        const catalogo = await getCatalogoForActivo(requisito.Activo.dependenciaId, requisito.Activo.type);
        const def = catalogo.find((c) => c.key === requisito.key);
        if (def) {
            validateRequisitoAgainstCatalogo(def, updateData.value !== undefined ? updateData.value : requisito.value, updateData.documentUrl !== undefined ? updateData.documentUrl : requisito.documentUrl, { key: requisito.key });
        }
    }
    await requisito.update(updateData);
    await requisito.reload({ include: [{ model: Activo, as: 'Activo' }] });
    logger.info({
        requisitoId: requisito.id,
        activoId: requisito.activoId,
        organizationId,
        updatedFields: Object.keys(updateData),
        requestingUserId,
    }, 'Requisito de activo actualizado exitosamente');
    return requisito;
};
/**
 * Elimina un requisito de activo (hard delete).
 *
 * @param requisitoId - ID del requisito
 * @param organizationId - ID de la organizaci?n (multi-tenant)
 * @param requestingUserId - ID del usuario que elimina
 * @throws {ForbiddenError} Si no tiene acceso a la organizaci?n
 * @throws {NotFoundError} Si el requisito no existe o su activo no pertenece a la organizaci?n
 */
export const deleteRequisito = async (requisitoId, organizationId, requestingUserId) => {
    await assertCanAccessOrganization(requestingUserId, organizationId);
    const requisito = await ActivoRequisito.findOne({
        where: { id: requisitoId },
        include: [{ model: Activo, as: 'Activo' }],
    });
    const dependenciaId = await getDependenciaIdFromAreaId(organizationId);
    if (!requisito || !requisito.Activo || requisito.Activo.dependenciaId !== dependenciaId) {
        throw new NotFoundError('Requisito de activo', { requisitoId, organizationId });
    }
    await requisito.destroy();
    logger.info({ requisitoId, activoId: requisito.activoId, organizationId, requestingUserId }, 'Requisito de activo eliminado exitosamente');
};
//# sourceMappingURL=activo-requisito.service.js.map