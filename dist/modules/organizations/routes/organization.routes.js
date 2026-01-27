import { Router } from 'express';
import { createOrganization, getOrganizationById, listOrganizations, updateOrganization, deleteOrganization, } from '../controllers/organization.controller.js';
import { validateCreateOrganization, validateUpdateOrganization, validateListOrganizations, } from '../middleware/validation.middleware.js';
import { authenticate, requireOrganizationAccess } from '../../../shared/middleware/index.js';
import membershipRouter from '../../../modules/users/routes/membership.routes.js';
import actividadRouter from '../../../modules/actividades/routes/actividad.routes.js';
import bloqueRouter, { bloqueActividadRouter } from '../../../modules/actividades/routes/bloque.routes.js';
import capacidadActividadRouter from '../../../modules/actividades/routes/capacidad.routes.js';
import prestadorRouter from '../../../modules/prestadores/routes/prestador-profile.routes.js';
import permisoRouter from '../../../modules/permisos/routes/permiso.routes.js';
import activoRouter from '../../../modules/activos/routes/activo.routes.js';
import activoRequisitoRouter from '../../../modules/activos/routes/activo-requisito.routes.js';
import eventoRouter from '../../../modules/eventos/routes/evento.routes.js';
import reporteRouter from '../../../modules/reportes/routes/reporte.routes.js';
import paymentRouter from '../../../modules/payments/routes/payment.routes.js';
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
/**
 * Rutas anidadas de memberships
 * Montadas bajo /api/v1/organizations/:organizationId/memberships
 */
organizationRouter.use('/:organizationId/memberships', membershipRouter);
/**
 * Rutas anidadas de actividades
 * Montadas bajo /api/v1/organizations/:organizationId/actividades
 */
organizationRouter.use('/:organizationId/actividades', actividadRouter);
/**
 * Rutas anidadas de bloques dentro de actividades
 * Montadas bajo /api/v1/organizations/:organizationId/actividades/:actividadId/bloques
 */
organizationRouter.use('/:organizationId/actividades/:actividadId/bloques', bloqueActividadRouter);
/**
 * Rutas anidadas de capacidad dentro de actividades
 * Montadas bajo /api/v1/organizations/:organizationId/actividades/:actividadId/capacidad
 */
organizationRouter.use('/:organizationId/actividades/:actividadId/capacidad', capacidadActividadRouter);
/**
 * Rutas anidadas de bloques (generales)
 * Montadas bajo /api/v1/organizations/:organizationId/bloques
 */
organizationRouter.use('/:organizationId/bloques', bloqueRouter);
/**
 * Rutas anidadas de prestadores
 * Montadas bajo /api/v1/organizations/:organizationId/prestadores
 */
organizationRouter.use('/:organizationId/prestadores', prestadorRouter);
/**
 * Rutas anidadas de permisos
 * Montadas bajo /api/v1/organizations/:organizationId/permisos
 */
organizationRouter.use('/:organizationId/permisos', permisoRouter);
/**
 * Rutas anidadas de activos
 * Montadas bajo /api/v1/organizations/:organizationId/activos
 */
organizationRouter.use('/:organizationId/activos', activoRouter);
/**
 * Rutas anidadas de requisitos de activos
 * Montadas bajo /api/v1/organizations/:organizationId/activos/:activoId/requisitos
 */
organizationRouter.use('/:organizationId/activos/:activoId/requisitos', activoRequisitoRouter);
/**
 * Rutas anidadas de eventos
 * Montadas bajo /api/v1/organizations/:organizationId/eventos
 */
organizationRouter.use('/:organizationId/eventos', eventoRouter);
/**
 * Rutas anidadas de reportes
 * Montadas bajo /api/v1/organizations/:organizationId/reportes
 */
organizationRouter.use('/:organizationId/reportes', reporteRouter);
/**
 * Rutas anidadas de pagos
 * Montadas bajo /api/v1/organizations/:organizationId/payments
 */
organizationRouter.use('/:organizationId/payments', paymentRouter);
export default organizationRouter;
//# sourceMappingURL=organization.routes.js.map