import type { UUID } from '../../../shared/database/types.js';
import { MovimientoStockAcceso } from '../../../modules/productos-acceso/models/movimiento-stock-acceso.model.js';
import type { EntradaStockDTO, SalidaStockDTO, ListMovimientosStockDTO } from '../../../modules/productos-acceso/validators/movimiento-stock-acceso.validator.js';
import type { PaginationMeta } from '../../../shared/responses/types.js';
/**
 * Registra una entrada de stock.
 * Requiere rol admin o gestor.
 * @param areaId - ID del área (organizationId en API); se resuelve a dependencia para producto/stock/movimiento.
 */
export declare const registrarEntrada: (areaId: UUID, productoAccesoId: UUID, data: EntradaStockDTO, userId: UUID) => Promise<MovimientoStockAcceso>;
/**
 * Registra una salida de stock (venta).
 * Usa transacción: valida stock >= cantidad, crea movimiento, decrementa stock.
 * No permite salida si stock disponible < cantidad.
 * @param areaId - ID del área (organizationId en API); producto/stock/prestador por dependencia, evento por área.
 */
export declare const registrarSalida: (areaId: UUID, productoAccesoId: UUID, data: SalidaStockDTO, userId: UUID) => Promise<MovimientoStockAcceso>;
/**
 * Obtiene el stock disponible para un producto.
 */
export declare const getStockDisponible: (areaId: UUID, productoAccesoId: UUID, userId: UUID) => Promise<{
    cantidad: number;
}>;
/**
 * Lista movimientos de stock con paginación y filtros.
 * Filtro por dependencia (resuelta desde areaId).
 */
export declare const listMovimientos: (areaId: UUID, filters: ListMovimientosStockDTO, userId: UUID) => Promise<{
    data: MovimientoStockAcceso[];
    pagination: PaginationMeta;
}>;
//# sourceMappingURL=stock-acceso.service.d.ts.map