import { Area } from '../../../modules/areas/models/area.model.js';
import { ActivoRequisitoCatalogo } from '../../../modules/activos/models/activo-requisito-catalogo.model.js';
import { Dependencia } from '../../../modules/dependencias/models/dependencia.model.js';
import { NotFoundError, ValidationError } from '../../../shared/errors/index.js';
import { logger } from '../../../shared/logger/index.js';
import { assertCanAccessOrganization } from '../../../modules/organizations/services/organization.service.js';
const getDependenciaIdFromAreaId = async (areaId) => {
    const area = await Area.findByPk(areaId);
    if (!area)
        throw new NotFoundError('Área', { areaId });
    return area.dependenciaId;
};
/**
 * Lista entradas del catálogo de requisitos para una dependencia (y opcionalmente por tipo de activo).
 */
export const listCatalogo = async (organizationId, filters, requestingUserId) => {
    await assertCanAccessOrganization(requestingUserId, organizationId);
    const dependenciaId = await getDependenciaIdFromAreaId(organizationId);
    const where = {
        dependenciaId,
        activo: true,
    };
    if (filters.tipoActivo) {
        where['tipoActivo'] = filters.tipoActivo;
    }
    const rows = await ActivoRequisitoCatalogo.findAll({
        where,
        order: [
            ['orden', 'ASC'],
            ['key', 'ASC'],
        ],
        include: [{ model: Dependencia, as: 'Dependencia', attributes: ['id', 'name'] }],
    });
    return rows;
};
/**
 * Crea una entrada en el catálogo. Valida unicidad (dependenciaId, tipoActivo, key).
 */
export const createCatalogoEntry = async (organizationId, data, requestingUserId) => {
    await assertCanAccessOrganization(requestingUserId, organizationId);
    const dependenciaId = await getDependenciaIdFromAreaId(organizationId);
    const existing = await ActivoRequisitoCatalogo.findOne({
        where: {
            dependenciaId,
            tipoActivo: data.tipoActivo,
            key: data.key,
        },
    });
    if (existing) {
        throw new ValidationError('Ya existe una entrada en el catálogo con esta clave para este tipo de activo', undefined, { dependenciaId, tipoActivo: data.tipoActivo, key: data.key });
    }
    const entry = await ActivoRequisitoCatalogo.create({
        dependenciaId,
        tipoActivo: data.tipoActivo,
        key: data.key,
        label: data.label ?? null,
        tipoDato: data.tipoDato,
        requerido: data.requerido ?? false,
        requiereDocumento: data.requiereDocumento ?? false,
        orden: data.orden ?? null,
        activo: data.activo ?? true,
    });
    await entry.reload({ include: [{ model: Dependencia, as: 'Dependencia' }] });
    logger.info({
        catalogoId: entry.id,
        dependenciaId,
        tipoActivo: entry.tipoActivo,
        key: entry.key,
        organizationId,
        requestingUserId,
    }, 'Entrada de catálogo de requisitos creada');
    return entry;
};
/**
 * Actualiza una entrada del catálogo. No se permite cambiar key, tipoActivo ni dependenciaId.
 */
export const updateCatalogoEntry = async (organizationId, catalogoId, data, requestingUserId) => {
    await assertCanAccessOrganization(requestingUserId, organizationId);
    const dependenciaId = await getDependenciaIdFromAreaId(organizationId);
    const entry = await ActivoRequisitoCatalogo.findOne({
        where: { id: catalogoId, dependenciaId },
    });
    if (!entry) {
        throw new NotFoundError('Entrada del catálogo', { catalogoId, organizationId });
    }
    const updateData = {};
    if (data.label !== undefined)
        updateData.label = data.label;
    if (data.tipoDato !== undefined)
        updateData.tipoDato = data.tipoDato;
    if (data.requerido !== undefined)
        updateData.requerido = data.requerido;
    if (data.requiereDocumento !== undefined)
        updateData.requiereDocumento = data.requiereDocumento;
    if (data.orden !== undefined)
        updateData.orden = data.orden;
    if (data.activo !== undefined)
        updateData.activo = data.activo;
    await entry.update(updateData);
    await entry.reload({ include: [{ model: Dependencia, as: 'Dependencia' }] });
    logger.info({
        catalogoId: entry.id,
        dependenciaId,
        updatedFields: Object.keys(updateData),
        organizationId,
        requestingUserId,
    }, 'Entrada de catálogo de requisitos actualizada');
    return entry;
};
/**
 * Elimina una entrada del catálogo.
 */
export const deleteCatalogoEntry = async (organizationId, catalogoId, requestingUserId) => {
    await assertCanAccessOrganization(requestingUserId, organizationId);
    const dependenciaId = await getDependenciaIdFromAreaId(organizationId);
    const entry = await ActivoRequisitoCatalogo.findOne({
        where: { id: catalogoId, dependenciaId },
    });
    if (!entry) {
        throw new NotFoundError('Entrada del catálogo', { catalogoId, organizationId });
    }
    await entry.destroy();
    logger.info({ catalogoId, dependenciaId, organizationId, requestingUserId }, 'Entrada de catálogo de requisitos eliminada');
};
/**
 * Obtiene las definiciones del catálogo para una dependencia y tipo de activo (para validación de requisitos).
 * Exportado para uso en activo-requisito.service.
 */
export const getCatalogoForActivo = async (dependenciaId, tipoActivo) => {
    return ActivoRequisitoCatalogo.findAll({
        where: { dependenciaId, tipoActivo, activo: true },
        order: [
            ['orden', 'ASC'],
            ['key', 'ASC'],
        ],
    });
};
//# sourceMappingURL=activo-requisito-catalogo.service.js.map