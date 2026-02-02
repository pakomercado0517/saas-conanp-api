import { Router, type Router as ExpressRouter } from 'express';
import {
  createActividad,
  getActividadById,
  listActividades,
  updateActividad,
  deleteActividad,
} from '../controllers/actividad.controller.js';
import {
  validateCreateActividad,
  validateUpdateActividad,
  validateListActividades,
} from '../middleware/validation.middleware.js';
import {
  authenticate,
  requireOrganizationAccess,
  requireAdmin,
  attachSubscriptionLimits,
} from '@/shared/middleware/index.js';

/**
 * Router de actividades
 *
 * Todas las rutas están bajo el prefijo /api/v1/organizations/:organizationId/actividades
 * Requiere autenticación y acceso a la organización (middleware requireOrganizationAccess)
 */
const actividadRouter: ExpressRouter = Router({ mergeParams: true });

/**
 * POST /api/v1/organizations/:organizationId/actividades
 * Crea una nueva actividad.
 * Solo los administradores pueden crear actividades.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Body:
 * - name: string (requerido)
 * - type: 'terrestre' | 'maritima' | 'mixta' (requerido)
 * - agendaType: 'BLOQUES' | 'HORARIO_LIBRE' (requerido)
 * - requiresGuide: boolean (opcional, default: false)
 * - impactLevel: string (opcional, máximo 50 caracteres)
 * - active: boolean (opcional, default: true)
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: Actividad,
 *   message: "Actividad creada exitosamente"
 * }
 */
actividadRouter.post(
  '/',
  authenticate,
  requireOrganizationAccess,
  requireAdmin,
  validateCreateActividad,
  createActividad
);

/**
 * GET /api/v1/organizations/:organizationId/actividades
 * Lista actividades con paginación y filtros.
 * Cualquier usuario con acceso a la organización puede listar actividades.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Query:
 * - page: number (default 1)
 * - limit: number (default 20, max 100)
 * - sortBy: 'name' | 'type' | 'agendaType' | 'active' | 'createdAt' | 'updatedAt' (opcional)
 * - sortOrder: 'asc' | 'desc' (default 'desc')
 * - name: string (opcional, búsqueda por nombre)
 * - type: 'terrestre' | 'maritima' | 'mixta' (opcional, filtro)
 * - agendaType: 'BLOQUES' | 'HORARIO_LIBRE' (opcional, filtro)
 * - active: boolean (opcional, filtro)
 * - requiresGuide: boolean (opcional, filtro)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Actividad[],
 *   pagination: { page, limit, total, totalPages },
 *   message: "Actividades obtenidas exitosamente"
 * }
 */
actividadRouter.get(
  '/',
  authenticate,
  requireOrganizationAccess,
  attachSubscriptionLimits,
  validateListActividades,
  listActividades
);

/**
 * GET /api/v1/organizations/:organizationId/actividades/:actividadId
 * Obtiene una actividad por ID.
 * Cualquier usuario con acceso a la organización puede leer actividades.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - actividadId: UUID
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Actividad,
 *   message: "Actividad obtenida exitosamente"
 * }
 */
actividadRouter.get('/:actividadId', authenticate, requireOrganizationAccess, getActividadById);

/**
 * PATCH /api/v1/organizations/:organizationId/actividades/:actividadId
 * Actualiza una actividad existente.
 * Solo los administradores pueden actualizar actividades.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - actividadId: UUID
 *
 * Body (al menos uno requerido):
 * - name: string (opcional)
 * - type: 'terrestre' | 'maritima' | 'mixta' (opcional)
 * - agendaType: 'BLOQUES' | 'HORARIO_LIBRE' (opcional)
 * - requiresGuide: boolean (opcional)
 * - impactLevel: string (opcional, máximo 50 caracteres)
 * - active: boolean (opcional)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Actividad actualizada,
 *   message: "Actividad actualizada exitosamente"
 * }
 */
actividadRouter.patch(
  '/:actividadId',
  authenticate,
  requireOrganizationAccess,
  requireAdmin,
  validateUpdateActividad,
  updateActividad
);

/**
 * DELETE /api/v1/organizations/:organizationId/actividades/:actividadId
 * Elimina una actividad (soft delete).
 * Solo los administradores pueden eliminar actividades.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - actividadId: UUID
 *
 * Respuesta 204: No Content
 */
actividadRouter.delete(
  '/:actividadId',
  authenticate,
  requireOrganizationAccess,
  requireAdmin,
  deleteActividad
);

export default actividadRouter;
