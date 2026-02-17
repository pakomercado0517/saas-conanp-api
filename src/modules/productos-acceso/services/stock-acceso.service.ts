import { Op } from 'sequelize';
import type { UUID } from '@/shared/database/types.js';
import { sequelize } from '@/shared/database/index.js';
import { ProductoAcceso } from '@/modules/productos-acceso/models/producto-acceso.model.js';
import { StockAcceso } from '@/modules/productos-acceso/models/stock-acceso.model.js';
import { MovimientoStockAcceso } from '@/modules/productos-acceso/models/movimiento-stock-acceso.model.js';
import type {
  EntradaStockDTO,
  SalidaStockDTO,
  ListMovimientosStockDTO,
} from '@/modules/productos-acceso/validators/movimiento-stock-acceso.validator.js';
import { assertCanAccessOrganization } from '@/modules/organizations/services/organization.service.js';
import { NotFoundError, ValidationError } from '@/shared/errors/index.js';
import type { PaginationMeta } from '@/shared/responses/types.js';
import { logger } from '@/shared/logger/index.js';

/**
 * Verifica que el producto exista y pertenezca a la organización.
 */
const assertProductoBelongsToOrg = async (
  organizationId: UUID,
  productoAccesoId: UUID
): Promise<ProductoAcceso> => {
  const producto = await ProductoAcceso.findOne({
    where: { id: productoAccesoId, organizationId },
  });
  if (!producto) {
    throw new NotFoundError('Producto de acceso', { productoAccesoId, organizationId });
  }
  return producto;
};

/**
 * Obtiene o crea el registro de stock para un producto (por si no existiera).
 */
const getOrCreateStock = async (
  organizationId: UUID,
  productoAccesoId: UUID
): Promise<StockAcceso> => {
  let stock = await StockAcceso.findOne({
    where: { organizationId, productoAccesoId },
  });
  if (!stock) {
    stock = await StockAcceso.create({
      organizationId,
      productoAccesoId,
      cantidad: 0,
    });
  }
  return stock;
};

/**
 * Registra una entrada de stock.
 * Requiere rol admin o gestor.
 */
export const registrarEntrada = async (
  organizationId: UUID,
  productoAccesoId: UUID,
  data: EntradaStockDTO,
  userId: UUID
): Promise<MovimientoStockAcceso> => {
  await assertCanAccessOrganization(userId, organizationId);
  await assertProductoBelongsToOrg(organizationId, productoAccesoId);

  const stock = await getOrCreateStock(organizationId, productoAccesoId);

  const movimiento = await MovimientoStockAcceso.create({
    organizationId,
    productoAccesoId,
    tipo: 'entrada',
    cantidad: data.cantidad,
    fecha: data.fecha,
    motivo: data.motivo,
    referencia: data.referencia ?? null,
    notas: data.notas ?? null,
    createdBy: userId,
  });

  await stock.increment('cantidad', { by: data.cantidad });

  logger.info(
    {
      movimientoId: movimiento.id,
      organizationId,
      productoAccesoId,
      cantidad: data.cantidad,
      motivo: data.motivo,
      userId,
    },
    'Entrada de stock registrada'
  );

  return movimiento;
};

/**
 * Registra una salida de stock (venta).
 * Usa transacción: valida stock >= cantidad, crea movimiento, decrementa stock.
 * No permite salida si stock disponible < cantidad.
 */
export const registrarSalida = async (
  organizationId: UUID,
  productoAccesoId: UUID,
  data: SalidaStockDTO,
  userId: UUID
): Promise<MovimientoStockAcceso> => {
  await assertCanAccessOrganization(userId, organizationId);
  await assertProductoBelongsToOrg(organizationId, productoAccesoId);

  const stock = await StockAcceso.findOne({
    where: { organizationId, productoAccesoId },
  });

  if (!stock) {
    throw new NotFoundError('Stock de acceso', { productoAccesoId, organizationId });
  }

  const disponible = stock.cantidad;
  if (disponible < data.cantidad) {
    throw new ValidationError(
      `Stock insuficiente. Disponible: ${disponible}, solicitado: ${data.cantidad}`,
      'cantidad',
      { disponible, solicitado: data.cantidad }
    );
  }

  const transaction = await sequelize.transaction();

  try {
    const movimiento = await MovimientoStockAcceso.create(
      {
        organizationId,
        productoAccesoId,
        tipo: 'salida',
        cantidad: data.cantidad,
        fecha: data.fecha,
        motivo: 'venta',
        montoUnitario: data.montoUnitario != null ? String(data.montoUnitario) : null,
        montoTotal: data.montoTotal != null ? String(data.montoTotal) : null,
        prestadorId: data.prestadorId ?? null,
        eventoId: data.eventoId ?? null,
        referencia: data.referencia ?? null,
        notas: data.notas ?? null,
        createdBy: userId,
      },
      { transaction }
    );

    await stock.decrement('cantidad', { by: data.cantidad, transaction });

    await transaction.commit();

    logger.info(
      {
        movimientoId: movimiento.id,
        organizationId,
        productoAccesoId,
        cantidad: data.cantidad,
        userId,
      },
      'Salida de stock registrada'
    );

    return movimiento;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

/**
 * Obtiene el stock disponible para un producto.
 */
export const getStockDisponible = async (
  organizationId: UUID,
  productoAccesoId: UUID,
  userId: UUID
): Promise<{ cantidad: number }> => {
  await assertCanAccessOrganization(userId, organizationId);
  await assertProductoBelongsToOrg(organizationId, productoAccesoId);

  const stock = await StockAcceso.findOne({
    where: { organizationId, productoAccesoId },
  });

  return { cantidad: stock?.cantidad ?? 0 };
};

/**
 * Lista movimientos de stock con paginación y filtros.
 */
export const listMovimientos = async (
  organizationId: UUID,
  filters: ListMovimientosStockDTO,
  userId: UUID
): Promise<{ data: MovimientoStockAcceso[]; pagination: PaginationMeta }> => {
  await assertCanAccessOrganization(userId, organizationId);

  const where: Record<string, unknown> = {
    organizationId,
  };

  if (filters.productoAccesoId) {
    where['productoAccesoId'] = filters.productoAccesoId;
  }
  if (filters.tipo) {
    where['tipo'] = filters.tipo;
  }
  if (filters.fechaDesde || filters.fechaHasta) {
    where['fecha'] = {
      ...(filters.fechaDesde && { [Op.gte]: filters.fechaDesde }),
      ...(filters.fechaHasta && { [Op.lte]: filters.fechaHasta }),
    };
  }
  if (filters.prestadorId) {
    where['prestadorId'] = filters.prestadorId;
  }
  if (filters.eventoId) {
    where['eventoId'] = filters.eventoId;
  }

  const limit = filters.limit;
  const sortBy = filters.sortBy ?? 'createdAt';
  const sortOrder = filters.sortOrder ?? 'desc';
  const offset = (filters.page - 1) * limit;

  const result = await MovimientoStockAcceso.findAndCountAll({
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
