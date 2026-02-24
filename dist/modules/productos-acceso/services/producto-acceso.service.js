import { Op } from 'sequelize';
import { Area } from '../../../modules/areas/models/area.model.js';
import { ProductoAcceso } from '../../../modules/productos-acceso/models/producto-acceso.model.js';
import { StockAcceso } from '../../../modules/productos-acceso/models/stock-acceso.model.js';
import { assertCanAccessOrganization } from '../../../modules/organizations/services/organization.service.js';
import { assertIsAdmin } from '../../../modules/users/services/membership.service.js';
import { NotFoundError } from '../../../shared/errors/index.js';
import { logger } from '../../../shared/logger/index.js';
/** Resuelve areaId (organizationId en API) a dependenciaId. Productos/stock son por dependencia. */
const getDependenciaIdFromAreaId = async (areaId) => {
    const area = await Area.findByPk(areaId);
    if (!area)
        throw new NotFoundError('Área', { areaId });
    return area.dependenciaId;
};
/**
 * Crea un nuevo producto de acceso y su registro de stock inicial (cantidad 0).
 * Solo los administradores pueden crear productos.
 * @param areaId - ID del área (organizationId en API); se resuelve a dependencia para persistencia.
 */
export const createProductoAcceso = async (areaId, data, userId) => {
    await assertIsAdmin(userId, areaId);
    await assertCanAccessOrganization(userId, areaId);
    const dependenciaId = await getDependenciaIdFromAreaId(areaId);
    const producto = await ProductoAcceso.create({
        dependenciaId,
        name: data.name,
        tipo: data.tipo,
        vigenciaDias: data.vigenciaDias,
        precioReferencia: data.precioReferencia != null ? String(data.precioReferencia) : null,
        active: data.active ?? true,
    });
    await StockAcceso.create({
        dependenciaId,
        productoAccesoId: producto.id,
        cantidad: 0,
    });
    logger.info({ productoAccesoId: producto.id, dependenciaId, name: producto.name, userId }, 'Producto de acceso creado con stock inicial 0');
    return producto;
};
/**
 * Obtiene un producto de acceso por ID.
 * Cualquier usuario con acceso al área puede leer.
 */
export const getProductoAccesoById = async (productoAccesoId, areaId, userId) => {
    await assertCanAccessOrganization(userId, areaId);
    const dependenciaId = await getDependenciaIdFromAreaId(areaId);
    const producto = await ProductoAcceso.findOne({
        where: {
            id: productoAccesoId,
            dependenciaId,
        },
    });
    if (!producto) {
        throw new NotFoundError('Producto de acceso', { productoAccesoId, dependenciaId });
    }
    return producto;
};
/**
 * Lista productos de acceso con paginación y filtros.
 * Filtro multi-tenant obligatorio por dependencia (resuelta desde areaId).
 */
export const listProductosAcceso = async (areaId, filters, userId) => {
    await assertCanAccessOrganization(userId, areaId);
    const dependenciaId = await getDependenciaIdFromAreaId(areaId);
    const where = {
        dependenciaId,
    };
    if (filters.name) {
        where['name'] = { [Op.iLike]: `%${filters.name}%` };
    }
    if (filters.tipo) {
        where['tipo'] = filters.tipo;
    }
    if (filters.active !== undefined) {
        where['active'] = filters.active;
    }
    const limit = filters.limit;
    const sortBy = filters.sortBy ?? 'createdAt';
    const sortOrder = filters.sortOrder ?? 'desc';
    const offset = (filters.page - 1) * limit;
    const result = await ProductoAcceso.findAndCountAll({
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
 * Actualiza un producto de acceso.
 * Solo los administradores pueden actualizar.
 */
export const updateProductoAcceso = async (productoAccesoId, areaId, data, userId) => {
    await assertIsAdmin(userId, areaId);
    await assertCanAccessOrganization(userId, areaId);
    const dependenciaId = await getDependenciaIdFromAreaId(areaId);
    const producto = await ProductoAcceso.findOne({
        where: {
            id: productoAccesoId,
            dependenciaId,
        },
    });
    if (!producto) {
        throw new NotFoundError('Producto de acceso', { productoAccesoId, dependenciaId });
    }
    const updateData = {};
    if (data.name !== undefined)
        updateData.name = data.name;
    if (data.tipo !== undefined)
        updateData.tipo = data.tipo;
    if (data.vigenciaDias !== undefined)
        updateData.vigenciaDias = data.vigenciaDias;
    if (data.precioReferencia !== undefined) {
        updateData.precioReferencia =
            data.precioReferencia != null ? String(data.precioReferencia) : null;
    }
    if (data.active !== undefined)
        updateData.active = data.active;
    await producto.update(updateData);
    logger.info({ productoAccesoId, dependenciaId, updatedFields: Object.keys(updateData), userId }, 'Producto de acceso actualizado');
    return producto;
};
/**
 * Elimina un producto de acceso (soft delete).
 * Solo los administradores pueden eliminar.
 */
export const deleteProductoAcceso = async (productoAccesoId, areaId, userId) => {
    await assertIsAdmin(userId, areaId);
    await assertCanAccessOrganization(userId, areaId);
    const dependenciaId = await getDependenciaIdFromAreaId(areaId);
    const producto = await ProductoAcceso.findOne({
        where: {
            id: productoAccesoId,
            dependenciaId,
        },
    });
    if (!producto) {
        throw new NotFoundError('Producto de acceso', { productoAccesoId, dependenciaId });
    }
    await producto.destroy();
    logger.info({ productoAccesoId, dependenciaId, userId }, 'Producto de acceso eliminado (soft delete)');
};
//# sourceMappingURL=producto-acceso.service.js.map