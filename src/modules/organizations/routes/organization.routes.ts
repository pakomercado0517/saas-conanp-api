import { Router, type Router as ExpressRouter } from 'express';
import {
  getOrganizationById,
  listOrganizations,
  updateOrganization,
  deleteOrganization,
  getConfigAcceso,
} from '../controllers/organization.controller.js';
import {
  validateUpdateOrganization,
  validateListOrganizations,
} from '../middleware/validation.middleware.js';
import { authenticate, requireOrganizationAccess } from '@/shared/middleware/index.js';
import membershipRouter from '@/modules/users/routes/membership.routes.js';
import invitationRouter from '@/modules/users/routes/invitation.routes.js';
import actividadRouter from '@/modules/actividades/routes/actividad.routes.js';
import bloqueRouter, { bloqueActividadRouter } from '@/modules/actividades/routes/bloque.routes.js';
import capacidadActividadRouter from '@/modules/actividades/routes/capacidad.routes.js';
import prestadorRouter from '@/modules/prestadores/routes/prestador-profile.routes.js';
import permisoRouter from '@/modules/permisos/routes/permiso.routes.js';
import activoRouter from '@/modules/activos/routes/activo.routes.js';
import activoRequisitoRouter from '@/modules/activos/routes/activo-requisito.routes.js';
import eventoRouter from '@/modules/eventos/routes/evento.routes.js';
import reporteRouter from '@/modules/reportes/routes/reporte.routes.js';
import paymentRouter from '@/modules/payments/routes/payment.routes.js';
import { subscriptionOrgRouter } from '@/modules/subscriptions/routes/subscription.routes.js';
import productoAccesoRouter from '@/modules/productos-acceso/routes/producto-acceso.routes.js';
import movimientoStockAccesoRouter from '@/modules/productos-acceso/routes/movimiento-stock-acceso.routes.js';

/**
 * Router de organizaciones
 *
 * Todas las rutas están bajo el prefijo /api/v1/organizations
 */
const organizationRouter: ExpressRouter = Router();

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
/**
 * GET /api/v1/organizations/:organizationId/config-acceso
 * Configuración de acceso (brazaletes/pasaporte) para el frontend. Ruta más específica primero.
 */
organizationRouter.get(
  '/:organizationId/config-acceso',
  authenticate,
  requireOrganizationAccess,
  getConfigAcceso
);

organizationRouter.get(
  '/:organizationId',
  authenticate,
  requireOrganizationAccess,
  getOrganizationById
);

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
organizationRouter.patch(
  '/:organizationId',
  authenticate,
  requireOrganizationAccess,
  validateUpdateOrganization,
  updateOrganization
);

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
organizationRouter.delete(
  '/:organizationId',
  authenticate,
  requireOrganizationAccess,
  deleteOrganization
);

/**
 * Rutas anidadas de memberships
 * Montadas bajo /api/v1/organizations/:organizationId/memberships
 */
organizationRouter.use('/:organizationId/memberships', membershipRouter);

/**
 * Rutas anidadas de invitaciones
 * Montadas bajo /api/v1/organizations/:organizationId/invitations
 */
organizationRouter.use('/:organizationId/invitations', invitationRouter);

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
organizationRouter.use(
  '/:organizationId/actividades/:actividadId/capacidad',
  capacidadActividadRouter
);

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

/**
 * Rutas anidadas de suscripciones
 * Montadas bajo /api/v1/organizations/:organizationId/subscriptions
 */
organizationRouter.use('/:organizationId/subscriptions', subscriptionOrgRouter);

/**
 * Rutas anidadas de productos de acceso (brazaletes, pasaportes)
 * Montadas bajo /api/v1/organizations/:organizationId/productos-acceso
 */
organizationRouter.use('/:organizationId/productos-acceso', productoAccesoRouter);

/**
 * Rutas anidadas de movimientos de stock (listado con filtros)
 * Montadas bajo /api/v1/organizations/:organizationId/movimientos-stock-acceso
 */
organizationRouter.use('/:organizationId/movimientos-stock-acceso', movimientoStockAccesoRouter);

export default organizationRouter;
