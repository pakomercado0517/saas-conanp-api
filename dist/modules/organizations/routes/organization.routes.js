import { Router } from 'express';
import { createOrganization, getOrganizationById, listOrganizations, updateOrganization, deleteOrganization, } from '../controllers/organization.controller.js';
import { validateCreateOrganization, validateUpdateOrganization, validateListOrganizations, } from '../middleware/validation.middleware.js';
import { authenticate, requireOrganizationAccess } from '../../../shared/middleware/index.js';
/**
 * Router de organizaciones
 *
 * Todas las rutas están bajo el prefijo /api/v1/organizations
 */
const organizationRouter = Router();
/**
 * POST /api/v1/organizations
 * Crea una nueva organización
 *
 * Body:
 * - name: string (1-255 caracteres)
 * - ecosystem_type: 'terrestre' | 'maritimo' | 'mixto'
 * - settings: object (opcional, default {})
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: { id, name, ecosystem_type, settings, createdAt, updatedAt },
 *   message: "Organización creada exitosamente"
 * }
 */
organizationRouter.post('/', validateCreateOrganization, createOrganization);
/**
 * GET /api/v1/organizations
 * Lista organizaciones con paginación y filtros (solo las que el usuario tiene acceso)
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Query:
 * - page: number (default 1)
 * - limit: number (default 20, max 100)
 * - sortBy: 'name' | 'createdAt' | 'ecosystem_type' | 'updatedAt' (opcional)
 * - sortOrder: 'asc' | 'desc' (default 'desc')
 * - name: string (opcional, búsqueda parcial)
 * - ecosystem_type: 'terrestre' | 'maritimo' | 'mixto' (opcional)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Organization[],
 *   pagination: { page, limit, total, totalPages },
 *   message: "Organizaciones obtenidas exitosamente"
 * }
 */
organizationRouter.get('/', authenticate, validateListOrganizations, listOrganizations);
/**
 * GET /api/v1/organizations/:organizationId
 * Obtiene una organización por ID
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: { id, name, ecosystem_type, settings, createdAt, updatedAt },
 *   message: "Organización obtenida exitosamente"
 * }
 */
organizationRouter.get('/:organizationId', authenticate, requireOrganizationAccess, getOrganizationById);
/**
 * PATCH /api/v1/organizations/:organizationId
 * Actualiza una organización
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Body (al menos uno requerido):
 * - name: string (1-255, opcional)
 * - ecosystem_type: 'terrestre' | 'maritimo' | 'mixto' (opcional)
 * - settings: object (opcional)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: { id, name, ecosystem_type, settings, createdAt, updatedAt },
 *   message: "Organización actualizada exitosamente"
 * }
 */
organizationRouter.patch('/:organizationId', authenticate, requireOrganizationAccess, validateUpdateOrganization, updateOrganization);
/**
 * DELETE /api/v1/organizations/:organizationId
 * Elimina una organización (soft delete)
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Respuesta 204: No Content
 */
organizationRouter.delete('/:organizationId', authenticate, requireOrganizationAccess, deleteOrganization);
export default organizationRouter;
//# sourceMappingURL=organization.routes.js.map