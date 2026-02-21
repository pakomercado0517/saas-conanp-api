import type { Request, Response } from 'express';
/**
 * Crea una nueva organización (super admin)
 *
 * POST /api/v1/admin/organizations
 */
export declare const createOrganization: (req: Request, res: Response) => Promise<Response>;
/**
 * Lista todas las organizaciones (super admin)
 *
 * GET /api/v1/admin/organizations
 */
export declare const listOrganizations: (req: Request, res: Response) => Promise<Response>;
/**
 * Obtiene una organización por ID (super admin)
 *
 * GET /api/v1/admin/organizations/:organizationId
 */
export declare const getOrganizationById: (req: Request, res: Response) => Promise<Response>;
/**
 * Actualiza una organización (super admin)
 *
 * PATCH /api/v1/admin/organizations/:organizationId
 */
export declare const updateOrganization: (req: Request, res: Response) => Promise<Response>;
/**
 * Elimina una organización (super admin, soft delete)
 *
 * DELETE /api/v1/admin/organizations/:organizationId
 */
export declare const deleteOrganization: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=organization-admin.controller.d.ts.map