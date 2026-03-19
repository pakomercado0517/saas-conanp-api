import type { Request, Response } from 'express';
/**
 * Lista el catálogo de requisitos de activos para el área (dependencia).
 * GET /api/v1/organizations/:organizationId/activo-requisito-catalogo
 */
export declare const listCatalogo: (req: Request, res: Response) => Promise<Response>;
/**
 * Crea una entrada en el catálogo.
 * POST /api/v1/organizations/:organizationId/activo-requisito-catalogo
 */
export declare const createCatalogoEntry: (req: Request, res: Response) => Promise<Response>;
/**
 * Actualiza una entrada del catálogo.
 * PATCH /api/v1/organizations/:organizationId/activo-requisito-catalogo/:catalogoId
 */
export declare const updateCatalogoEntry: (req: Request, res: Response) => Promise<Response>;
/**
 * Elimina una entrada del catálogo.
 * DELETE /api/v1/organizations/:organizationId/activo-requisito-catalogo/:catalogoId
 */
export declare const deleteCatalogoEntry: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=activo-requisito-catalogo.controller.d.ts.map