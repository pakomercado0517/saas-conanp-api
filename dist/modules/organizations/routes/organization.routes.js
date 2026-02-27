import { Router } from 'express';
import { createOrganization, getOrganizationById, listOrganizations, updateOrganization, deleteOrganization, getConfigAcceso, } from '../controllers/organization.controller.js';
import { validateCreateOrganization, validateUpdateOrganization, validateListOrganizations, } from '../middleware/validation.middleware.js';
import { authenticate, requireOrganizationAccess, requireOnboardingComplete, } from '../../../shared/middleware/index.js';
import membershipRouter from '../../../modules/users/routes/membership.routes.js';
import invitationRouter from '../../../modules/users/routes/invitation.routes.js';
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
import { subscriptionOrgRouter } from '../../../modules/subscriptions/routes/subscription.routes.js';
import productoAccesoRouter from '../../../modules/productos-acceso/routes/producto-acceso.routes.js';
import movimientoStockAccesoRouter from '../../../modules/productos-acceso/routes/movimiento-stock-acceso.routes.js';
/**
 * Router de áreas (antes "organizations").
 * Parámetro de ruta: areaId. Montado en /api/v1/areas y /api/v1/organizations (compatibilidad).
 */
const organizationRouter = Router();
/**
 * POST /api/v1/areas (o /api/v1/organizations)
 * Crea dependencia y primera área (onboarding). Sin auth.
 * @deprecated Preferir flujo: POST /dependencias (auth) + POST /dependencias/:dependenciaId/areas.
 * Se mantiene por compatibilidad; la respuesta incluye cabecera X-Deprecation-Warning.
 */
organizationRouter.post('/', validateCreateOrganization, createOrganization);
/**
 * GET /api/v1/areas (o /api/v1/organizations)
 * Lista áreas con paginación y filtros (solo las que el usuario tiene acceso)
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
organizationRouter.get('/', authenticate, requireOnboardingComplete, validateListOrganizations, listOrganizations);
/**
 * GET /api/v1/areas/:areaId (o /api/v1/organizations/:areaId)
 * Obtiene un área por ID. Params: areaId (UUID).
 */
/**
 * GET /api/v1/areas/:areaId/config-acceso
 * Configuración de acceso (brazaletes/pasaporte). Ruta más específica primero.
 */
organizationRouter.get('/:areaId/config-acceso', authenticate, requireOnboardingComplete, requireOrganizationAccess, getConfigAcceso);
organizationRouter.get('/:areaId', authenticate, requireOnboardingComplete, requireOrganizationAccess, getOrganizationById);
/**
 * PATCH /api/v1/areas/:areaId
 * Actualiza un área. Params: areaId. Body: name, ecosystem_type, settings (opcionales).
 */
organizationRouter.patch('/:areaId', authenticate, requireOnboardingComplete, requireOrganizationAccess, validateUpdateOrganization, updateOrganization);
/**
 * DELETE /api/v1/areas/:areaId
 * Elimina un área (soft delete). Params: areaId.
 */
organizationRouter.delete('/:areaId', authenticate, requireOnboardingComplete, requireOrganizationAccess, deleteOrganization);
organizationRouter.use('/:areaId/memberships', membershipRouter);
organizationRouter.use('/:areaId/invitations', invitationRouter);
organizationRouter.use('/:areaId/actividades', actividadRouter);
organizationRouter.use('/:areaId/actividades/:actividadId/bloques', bloqueActividadRouter);
organizationRouter.use('/:areaId/actividades/:actividadId/capacidad', capacidadActividadRouter);
organizationRouter.use('/:areaId/bloques', bloqueRouter);
organizationRouter.use('/:areaId/prestadores', prestadorRouter);
organizationRouter.use('/:areaId/permisos', permisoRouter);
organizationRouter.use('/:areaId/activos', activoRouter);
organizationRouter.use('/:areaId/activos/:activoId/requisitos', activoRequisitoRouter);
organizationRouter.use('/:areaId/eventos', eventoRouter);
organizationRouter.use('/:areaId/reportes', reporteRouter);
organizationRouter.use('/:areaId/payments', paymentRouter);
organizationRouter.use('/:areaId/subscriptions', subscriptionOrgRouter);
organizationRouter.use('/:areaId/productos-acceso', productoAccesoRouter);
organizationRouter.use('/:areaId/movimientos-stock-acceso', movimientoStockAccesoRouter);
export default organizationRouter;
//# sourceMappingURL=organization.routes.js.map