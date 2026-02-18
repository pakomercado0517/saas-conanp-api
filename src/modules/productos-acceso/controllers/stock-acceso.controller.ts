import type { Request, Response } from 'express';
import * as stockAccesoService from '../services/stock-acceso.service.js';
import { sendSuccess, sendCreated, sendPaginated } from '@/shared/responses/helpers.js';
import type {
  EntradaStockDTO,
  SalidaStockDTO,
  ListMovimientosStockDTO,
} from '../validators/movimiento-stock-acceso.validator.js';
import { Membership } from '@/modules/users/models/membership.model.js';
import { PrestadorProfile } from '@/modules/prestadores/models/prestador-profile.model.js';

/**
 * POST .../productos-acceso/:productoAccesoId/entrada
 * Registra una entrada de stock.
 */
export const registrarEntrada = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const productoAccesoId = req.params['productoAccesoId'] as string;
  const userId = req.user.userId;
  const data = req.body as EntradaStockDTO;

  const movimiento = await stockAccesoService.registrarEntrada(
    organizationId,
    productoAccesoId,
    data,
    userId
  );

  return sendCreated(res, movimiento, 'Entrada de stock registrada exitosamente');
};

/**
 * POST .../productos-acceso/:productoAccesoId/salida
 * Registra una salida de stock (venta).
 */
export const registrarSalida = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const productoAccesoId = req.params['productoAccesoId'] as string;
  const userId = req.user.userId;
  const data = req.body as SalidaStockDTO;

  const movimiento = await stockAccesoService.registrarSalida(
    organizationId,
    productoAccesoId,
    data,
    userId
  );

  return sendCreated(res, movimiento, 'Salida de stock registrada exitosamente');
};

/**
 * GET .../productos-acceso/:productoAccesoId/stock
 * Obtiene el stock disponible de un producto.
 */
export const getStockDisponible = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const productoAccesoId = req.params['productoAccesoId'] as string;
  const userId = req.user.userId;

  const stock = await stockAccesoService.getStockDisponible(
    organizationId,
    productoAccesoId,
    userId
  );

  return sendSuccess(res, stock, 'Stock obtenido exitosamente');
};

/**
 * GET .../movimientos-stock-acceso
 * Lista movimientos con paginación y filtros.
 * Los prestadores solo pueden ver sus propios movimientos (salidas/ventas asociadas a su perfil).
 */
export const listMovimientos = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const userId = req.user.userId;
  const filters: ListMovimientosStockDTO = {
    ...((req.validatedQuery as ListMovimientosStockDTO | undefined) ??
      (req.query as unknown as ListMovimientosStockDTO)),
  };

  const membership = await Membership.findOne({
    where: { userId, organizationId, status: 'activo' },
  });
  if (membership?.role === 'prestador') {
    const myProfile = await PrestadorProfile.findOne({
      where: { userId, organizationId },
    });
    if (myProfile) {
      filters.prestadorId = myProfile.id;
    }
  }

  const result = await stockAccesoService.listMovimientos(organizationId, filters, userId);

  return sendPaginated(res, result.data, result.pagination, 'Movimientos obtenidos exitosamente');
};
