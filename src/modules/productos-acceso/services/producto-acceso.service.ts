import { Op } from 'sequelize';
import type { UUID } from '@/shared/database/types.js';
import { ProductoAcceso } from '@/modules/productos-acceso/models/producto-acceso.model.js';
import { StockAcceso } from '@/modules/productos-acceso/models/stock-acceso.model.js';
import type {
  CreateProductoAccesoDTO,
  UpdateProductoAccesoDTO,
  ListProductosAccesoDTO,
} from '@/modules/productos-acceso/validators/producto-acceso.validator.js';
import { assertCanAccessOrganization } from '@/modules/organizations/services/organization.service.js';
import { assertIsAdmin } from '@/modules/users/services/membership.service.js';
import { NotFoundError } from '@/shared/errors/index.js';
import type { PaginationMeta } from '@/shared/responses/types.js';
import { logger } from '@/shared/logger/index.js';

/**
 * Crea un nuevo producto de acceso y su registro de stock inicial (cantidad 0).
 * Solo los administradores pueden crear productos.
 */
export const createProductoAcceso = async (
  organizationId: UUID,
  data: CreateProductoAccesoDTO,
  userId: UUID
): Promise<ProductoAcceso> => {
  await assertIsAdmin(userId, organizationId);
  await assertCanAccessOrganization(userId, organizationId);

  const producto = await ProductoAcceso.create({
    organizationId,
    name: data.name,
    tipo: data.tipo,
    vigenciaDias: data.vigenciaDias,
    precioReferencia: data.precioReferencia != null ? String(data.precioReferencia) : null,
    active: data.active ?? true,
  });

  await StockAcceso.create({
    organizationId,
    productoAccesoId: producto.id,
    cantidad: 0,
  });

  logger.info(
    { productoAccesoId: producto.id, organizationId, name: producto.name, userId },
    'Producto de acceso creado con stock inicial 0'
  );

  return producto;
};

/**
 * Obtiene un producto de acceso por ID.
 * Cualquier usuario con acceso a la organización puede leer.
 */
export const getProductoAccesoById = async (
  productoAccesoId: UUID,
  organizationId: UUID,
  userId: UUID
): Promise<ProductoAcceso> => {
  await assertCanAccessOrganization(userId, organizationId);

  const producto = await ProductoAcceso.findOne({
    where: {
      id: productoAccesoId,
      organizationId,
    },
  });

  if (!producto) {
    throw new NotFoundError('Producto de acceso', { productoAccesoId, organizationId });
  }

  return producto;
};

/**
 * Lista productos de acceso con paginación y filtros.
 * Filtro multi-tenant obligatorio por organizationId.
 */
export const listProductosAcceso = async (
  organizationId: UUID,
  filters: ListProductosAccesoDTO,
  userId: UUID
): Promise<{ data: ProductoAcceso[]; pagination: PaginationMeta }> => {
  await assertCanAccessOrganization(userId, organizationId);

  const where: Record<string, unknown> = {
    organizationId,
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
 * Actualiza un producto de acceso.
 * Solo los administradores pueden actualizar.
 */
export const updateProductoAcceso = async (
  productoAccesoId: UUID,
  organizationId: UUID,
  data: UpdateProductoAccesoDTO,
  userId: UUID
): Promise<ProductoAcceso> => {
  await assertIsAdmin(userId, organizationId);
  await assertCanAccessOrganization(userId, organizationId);

  const producto = await ProductoAcceso.findOne({
    where: {
      id: productoAccesoId,
      organizationId,
    },
  });

  if (!producto) {
    throw new NotFoundError('Producto de acceso', { productoAccesoId, organizationId });
  }

  const updateData: Partial<{
    name: string;
    tipo: 'brazalete' | 'pasaporte';
    vigenciaDias: number;
    precioReferencia: string | null;
    active: boolean;
  }> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.tipo !== undefined) updateData.tipo = data.tipo;
  if (data.vigenciaDias !== undefined) updateData.vigenciaDias = data.vigenciaDias;
  if (data.precioReferencia !== undefined) {
    updateData.precioReferencia =
      data.precioReferencia != null ? String(data.precioReferencia) : null;
  }
  if (data.active !== undefined) updateData.active = data.active;

  await producto.update(updateData);

  logger.info(
    { productoAccesoId, organizationId, updatedFields: Object.keys(updateData), userId },
    'Producto de acceso actualizado'
  );

  return producto;
};

/**
 * Elimina un producto de acceso (soft delete).
 * Solo los administradores pueden eliminar.
 */
export const deleteProductoAcceso = async (
  productoAccesoId: UUID,
  organizationId: UUID,
  userId: UUID
): Promise<void> => {
  await assertIsAdmin(userId, organizationId);
  await assertCanAccessOrganization(userId, organizationId);

  const producto = await ProductoAcceso.findOne({
    where: {
      id: productoAccesoId,
      organizationId,
    },
  });

  if (!producto) {
    throw new NotFoundError('Producto de acceso', { productoAccesoId, organizationId });
  }

  await producto.destroy();

  logger.info(
    { productoAccesoId, organizationId, userId },
    'Producto de acceso eliminado (soft delete)'
  );
};
