import { Op } from 'sequelize';
import type { UUID } from '@/shared/database/types.js';
import { sequelize } from '@/shared/database/index.js';
import { Area } from '@/modules/areas/models/area.model.js';
import { ProductoAcceso } from '@/modules/productos-acceso/models/producto-acceso.model.js';
import { StockAcceso } from '@/modules/productos-acceso/models/stock-acceso.model.js';
import { MovimientoStockAcceso } from '@/modules/productos-acceso/models/movimiento-stock-acceso.model.js';
import { PrestadorProfile } from '@/modules/prestadores/models/prestador-profile.model.js';
import { EventoOperativo } from '@/modules/eventos/models/evento-operativo.model.js';
import type {
  EntradaStockDTO,
  SalidaStockDTO,
  ListMovimientosStockDTO,
} from '@/modules/productos-acceso/validators/movimiento-stock-acceso.validator.js';
import { assertCanAccessOrganization } from '@/modules/organizations/services/organization.service.js';
import { NotFoundError, ValidationError } from '@/shared/errors/index.js';
import type { PaginationMeta } from '@/shared/responses/types.js';
import { logger } from '@/shared/logger/index.js';

/** Resuelve areaId (organizationId en API) a dependenciaId. Productos/stock/prestadores son por dependencia. */
const getDependenciaIdFromAreaId = async (areaId: UUID): Promise<UUID> => {
  const area = await Area.findByPk(areaId);
  if (!area) throw new NotFoundError('Área', { areaId });
  return area.dependenciaId;
};

/** Verifica que el producto exista y pertenezca a la dependencia. */
const assertProductoBelongsToDependencia = async (
  dependenciaId: UUID,
  productoAccesoId: UUID
): Promise<ProductoAcceso> => {
  const producto = await ProductoAcceso.findOne({
    where: { id: productoAccesoId, dependenciaId },
  });
  if (!producto) {
    throw new NotFoundError('Producto de acceso', { productoAccesoId, dependenciaId });
  }
  return producto;
};

/** Obtiene o crea el registro de stock para un producto (por dependencia). */
const getOrCreateStock = async (
  dependenciaId: UUID,
  productoAccesoId: UUID
): Promise<StockAcceso> => {
  let stock = await StockAcceso.findOne({
    where: { dependenciaId, productoAccesoId },
  });
  if (!stock) {
    stock = await StockAcceso.create({
      dependenciaId,
      productoAccesoId,
      cantidad: 0,
    });
  }
  return stock;
};

/** Verifica que el prestador exista y pertenezca a la dependencia. */
const assertPrestadorBelongsToDependencia = async (
  dependenciaId: UUID,
  prestadorId: UUID
): Promise<void> => {
  const prestador = await PrestadorProfile.findOne({
    where: { id: prestadorId, dependenciaId },
  });
  if (!prestador) {
    throw new NotFoundError('Prestador', { prestadorId, dependenciaId });
  }
};

/** Verifica que el evento exista y pertenezca al área. */
const assertEventoBelongsToArea = async (areaId: UUID, eventoId: UUID): Promise<void> => {
  const evento = await EventoOperativo.findOne({
    where: { id: eventoId, areaId },
  });
  if (!evento) {
    throw new NotFoundError('Evento operativo', { eventoId, areaId });
  }
};

/**
 * Registra una entrada de stock.
 * Requiere rol admin o gestor.
 * @param areaId - ID del área (organizationId en API); se resuelve a dependencia para producto/stock/movimiento.
 */
export const registrarEntrada = async (
  areaId: UUID,
  productoAccesoId: UUID,
  data: EntradaStockDTO,
  userId: UUID
): Promise<MovimientoStockAcceso> => {
  await assertCanAccessOrganization(userId, areaId);
  const dependenciaId = await getDependenciaIdFromAreaId(areaId);
  await assertProductoBelongsToDependencia(dependenciaId, productoAccesoId);

  const stock = await getOrCreateStock(dependenciaId, productoAccesoId);

  const movimiento = await MovimientoStockAcceso.create({
    dependenciaId,
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
      dependenciaId,
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
 * @param areaId - ID del área (organizationId en API); producto/stock/prestador por dependencia, evento por área.
 */
export const registrarSalida = async (
  areaId: UUID,
  productoAccesoId: UUID,
  data: SalidaStockDTO,
  userId: UUID
): Promise<MovimientoStockAcceso> => {
  await assertCanAccessOrganization(userId, areaId);
  const dependenciaId = await getDependenciaIdFromAreaId(areaId);
  await assertProductoBelongsToDependencia(dependenciaId, productoAccesoId);
  if (data.prestadorId) {
    await assertPrestadorBelongsToDependencia(dependenciaId, data.prestadorId);
  }
  if (data.eventoId) {
    await assertEventoBelongsToArea(areaId, data.eventoId);
  }

  const stock = await StockAcceso.findOne({
    where: { dependenciaId, productoAccesoId },
  });

  if (!stock) {
    throw new NotFoundError('Stock de acceso', { productoAccesoId, dependenciaId });
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
        dependenciaId,
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
        dependenciaId,
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
  areaId: UUID,
  productoAccesoId: UUID,
  userId: UUID
): Promise<{ cantidad: number }> => {
  await assertCanAccessOrganization(userId, areaId);
  const dependenciaId = await getDependenciaIdFromAreaId(areaId);
  await assertProductoBelongsToDependencia(dependenciaId, productoAccesoId);

  const stock = await StockAcceso.findOne({
    where: { dependenciaId, productoAccesoId },
  });

  return { cantidad: stock?.cantidad ?? 0 };
};

/**
 * Lista movimientos de stock con paginación y filtros.
 * Filtro por dependencia (resuelta desde areaId).
 */
export const listMovimientos = async (
  areaId: UUID,
  filters: ListMovimientosStockDTO,
  userId: UUID
): Promise<{ data: MovimientoStockAcceso[]; pagination: PaginationMeta }> => {
  await assertCanAccessOrganization(userId, areaId);
  const dependenciaId = await getDependenciaIdFromAreaId(areaId);

  const where: Record<string, unknown> = {
    dependenciaId,
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
