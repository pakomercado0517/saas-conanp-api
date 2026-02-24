import { Router } from 'express';
import { createProductoAcceso, getProductoAccesoById, listProductosAcceso, updateProductoAcceso, deleteProductoAcceso, } from '../controllers/producto-acceso.controller.js';
import { registrarEntrada, registrarSalida, getStockDisponible, } from '../controllers/stock-acceso.controller.js';
import { validateCreateProductoAcceso, validateUpdateProductoAcceso, validateListProductosAcceso, validateEntradaStock, validateSalidaStock, } from '../middleware/validation.middleware.js';
import { authenticate, requireOrganizationAccess, requireAdmin, requireRole, } from '../../../shared/middleware/index.js';
/**
 * Router de productos de acceso (brazaletes, pasaportes).
 * Montado bajo /api/v1/organizations/:organizationId/productos-acceso
 */
const productoAccesoRouter = Router({ mergeParams: true });
productoAccesoRouter.post('/', authenticate, requireOrganizationAccess, requireAdmin, validateCreateProductoAcceso, createProductoAcceso);
productoAccesoRouter.get('/', authenticate, requireOrganizationAccess, validateListProductosAcceso, listProductosAcceso);
/* Rutas de stock (antes de /:productoAccesoId para que no se confunda "entrada"|"salida"|"stock" con ID) */
productoAccesoRouter.post('/:productoAccesoId/entrada', authenticate, requireOrganizationAccess, requireRole(['admin', 'gestor']), validateEntradaStock, registrarEntrada);
productoAccesoRouter.post('/:productoAccesoId/salida', authenticate, requireOrganizationAccess, requireRole(['admin', 'gestor']), validateSalidaStock, registrarSalida);
productoAccesoRouter.get('/:productoAccesoId/stock', authenticate, requireOrganizationAccess, getStockDisponible);
productoAccesoRouter.get('/:productoAccesoId', authenticate, requireOrganizationAccess, getProductoAccesoById);
productoAccesoRouter.patch('/:productoAccesoId', authenticate, requireOrganizationAccess, requireAdmin, validateUpdateProductoAcceso, updateProductoAcceso);
productoAccesoRouter.delete('/:productoAccesoId', authenticate, requireOrganizationAccess, requireAdmin, deleteProductoAcceso);
export default productoAccesoRouter;
//# sourceMappingURL=producto-acceso.routes.js.map