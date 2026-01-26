import { Router } from 'express';
import { createActivo, getActivoById, listActivos, updateActivo, deleteActivo, approveActivo, } from '../controllers/activo.controller.js';
import { validateCreateActivo, validateUpdateActivo, validateListActivos, } from '../middleware/validation.middleware.js';
import { authenticate, requireOrganizationAccess, requireAdmin, } from '../../../shared/middleware/index.js';
/**
 * Router de activos
 *
 * Todas las rutas están bajo el prefijo /api/v1/organizations/:organizationId/activos
 * Requiere autenticación y acceso a la organización (middleware requireOrganizationAccess)
 */
const activoRouter = Router({ mergeParams: true });
/**
 * POST /api/v1/organizations/:organizationId/activos
 * Crea un nuevo activo.
 * Solo los administradores pueden crear activos.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Body:
 * - organizationId: UUID (requerido, debe coincidir con el parámetro)
 * - ownerId: UUID (requerido)
 * - type: 'embarcacion' | 'vehiculo' | 'guia' | 'equipo' (requerido)
 * - status: 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido' (opcional, default: 'pendiente')
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: Activo con relaciones Organization y Owner,
 *   message: "Activo creado exitosamente"
 * }
 */
activoRouter.post('/', authenticate, requireOrganizationAccess, requireAdmin, validateCreateActivo, createActivo);
/**
 * GET /api/v1/organizations/:organizationId/activos
 * Lista activos con paginación y filtros.
 * Cualquier usuario con acceso a la organización puede listar activos.
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
 * - sortBy: 'type' | 'status' | 'createdAt' | 'updatedAt' (opcional)
 * - sortOrder: 'asc' | 'desc' (default 'desc')
 * - ownerId: UUID (opcional, filtro por propietario)
 * - type: 'embarcacion' | 'vehiculo' | 'guia' | 'equipo' (opcional, filtro)
 * - status: 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido' (opcional, filtro)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Activo[] con relaciones Organization y Owner,
 *   pagination: { page, limit, total, totalPages },
 *   message: "Activos obtenidos exitosamente"
 * }
 */
activoRouter.get('/', authenticate, requireOrganizationAccess, validateListActivos, listActivos);
/**
 * GET /api/v1/organizations/:organizationId/activos/:activoId
 * Obtiene un activo por ID.
 * Cualquier usuario con acceso a la organización puede leer activos.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - activoId: UUID
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Activo con relaciones Organization y Owner,
 *   message: "Activo obtenido exitosamente"
 * }
 */
activoRouter.get('/:activoId', authenticate, requireOrganizationAccess, getActivoById);
/**
 * PATCH /api/v1/organizations/:organizationId/activos/:activoId
 * Actualiza un activo existente.
 * Solo los administradores pueden actualizar activos.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - activoId: UUID
 *
 * Body (al menos uno requerido):
 * - type: 'embarcacion' | 'vehiculo' | 'guia' | 'equipo' (opcional)
 * - status: 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido' (opcional)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Activo actualizado con relaciones Organization y Owner,
 *   message: "Activo actualizado exitosamente"
 * }
 */
activoRouter.patch('/:activoId', authenticate, requireOrganizationAccess, requireAdmin, validateUpdateActivo, updateActivo);
/**
 * DELETE /api/v1/organizations/:organizationId/activos/:activoId
 * Elimina un activo (soft delete).
 * Solo los administradores pueden eliminar activos.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - activoId: UUID
 *
 * Respuesta 204: No Content
 */
activoRouter.delete('/:activoId', authenticate, requireOrganizationAccess, requireAdmin, deleteActivo);
/**
 * POST /api/v1/organizations/:organizationId/activos/:activoId/aprobar
 * Aprueba un activo (cambia su estado a 'aprobado').
 * Solo los administradores pueden aprobar activos.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - activoId: UUID
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Activo actualizado con relaciones Organization y Owner,
 *   message: "Activo aprobado exitosamente"
 * }
 */
activoRouter.post('/:activoId/aprobar', authenticate, requireOrganizationAccess, requireAdmin, approveActivo);
export default activoRouter;
//# sourceMappingURL=activo.routes.js.map