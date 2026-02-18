import type { Request, Response } from 'express';
/**
 * POST .../productos-acceso/:productoAccesoId/entrada
 * Registra una entrada de stock.
 */
export declare const registrarEntrada: (req: Request, res: Response) => Promise<Response>;
/**
 * POST .../productos-acceso/:productoAccesoId/salida
 * Registra una salida de stock (venta).
 */
export declare const registrarSalida: (req: Request, res: Response) => Promise<Response>;
/**
 * GET .../productos-acceso/:productoAccesoId/stock
 * Obtiene el stock disponible de un producto.
 */
export declare const getStockDisponible: (req: Request, res: Response) => Promise<Response>;
/**
 * GET .../movimientos-stock-acceso
 * Lista movimientos con paginación y filtros.
 * Los prestadores solo pueden ver sus propios movimientos (salidas/ventas asociadas a su perfil).
 */
export declare const listMovimientos: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=stock-acceso.controller.d.ts.map