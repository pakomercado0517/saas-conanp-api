import type { Request, Response } from 'express';
/**
 * Crea una nueva organización
 *
 * POST /api/v1/organizations
 */
export declare const createOrganization: (req: Request, res: Response) => Promise<Response>;
/**
 * Obtiene una organización por ID
 *
 * GET /api/v1/organizations/:organizationId
 */
export declare const getOrganizationById: (req: Request, res: Response) => Promise<Response>;
/**
 * Lista organizaciones con paginación y filtros
 *
 * GET /api/v1/organizations
 */
export declare const listOrganizations: (req: Request, res: Response) => Promise<Response>;
/**
 * Actualiza una organización
 *
 * PATCH /api/v1/organizations/:organizationId
 */
export declare const updateOrganization: (req: Request, res: Response) => Promise<Response>;
/**
 * Elimina una organización (soft delete)
 *
 * DELETE /api/v1/organizations/:organizationId
 */
export declare const deleteOrganization: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=organization.controller.d.ts.map