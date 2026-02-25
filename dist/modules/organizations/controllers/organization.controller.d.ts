import type { Request, Response } from 'express';
/**
 * Crea una nueva organización (dependencia + primera área). Onboarding sin auth.
 * POST /api/v1/areas o POST /api/v1/organizations
 * @deprecated Usar POST /dependencias y POST /dependencias/:dependenciaId/areas para el nuevo flujo.
 */
export declare const createOrganization: (req: Request, res: Response) => Promise<Response>;
/**
 * Obtiene la configuración de acceso (brazaletes/pasaporte) de la organización.
 * El frontend usa esto para mostrar u ocultar secciones de brazaletes, stock y ventas.
 *
 * GET /api/v1/organizations/:organizationId/config-acceso
 */
export declare const getConfigAcceso: (req: Request, res: Response) => Promise<Response>;
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