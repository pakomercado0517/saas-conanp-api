import { Router, type Router as ExpressRouter } from 'express';
import { listMovimientos } from '../controllers/stock-acceso.controller.js';
import { validateListMovimientosStock } from '../middleware/validation.middleware.js';
import { authenticate, requireOrganizationAccess } from '@/shared/middleware/index.js';

/**
 * Router de movimientos de stock (listado con filtros).
 * Montado bajo /api/v1/organizations/:organizationId/movimientos-stock-acceso
 */
const movimientoStockAccesoRouter: ExpressRouter = Router({ mergeParams: true });

movimientoStockAccesoRouter.get(
  '/',
  authenticate,
  requireOrganizationAccess,
  validateListMovimientosStock,
  listMovimientos
);

export default movimientoStockAccesoRouter;
