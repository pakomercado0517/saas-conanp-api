import type { Request, Response } from 'express';
/**
 * POST /api/v1/organizations/:organizationId/productos-acceso
 * Crea un nuevo producto de acceso (y registro de stock con cantidad 0).
 * Solo administradores.
 */
export declare const createProductoAcceso: (req: Request, res: Response) => Promise<Response>;
/**
 * GET /api/v1/organizations/:organizationId/productos-acceso/:productoAccesoId
 * Obtiene un producto de acceso por ID.
 */
export declare const getProductoAccesoById: (req: Request, res: Response) => Promise<Response>;
/**
 * GET /api/v1/organizations/:organizationId/productos-acceso
 * Lista productos de acceso con paginación y filtros.
 */
export declare const listProductosAcceso: (req: Request, res: Response) => Promise<Response>;
/**
 * PATCH /api/v1/organizations/:organizationId/productos-acceso/:productoAccesoId
 * Actualiza un producto de acceso. Solo administradores.
 */
export declare const updateProductoAcceso: (req: Request, res: Response) => Promise<Response>;
/**
 * DELETE /api/v1/organizations/:organizationId/productos-acceso/:productoAccesoId
 * Elimina un producto de acceso (soft delete). Solo administradores.
 */
export declare const deleteProductoAcceso: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=producto-acceso.controller.d.ts.map