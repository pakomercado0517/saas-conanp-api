import { Router } from 'express';
import { createPermiso, getPermisoById, listPermisos, updatePermiso, } from '../controllers/permiso.controller.js';
import { validateCreatePermiso, validateUpdatePermiso, validateListPermisos, } from '../middleware/validation.middleware.js';
import { authenticate, requireOrganizationAccess, requireAdmin, } from '../../../shared/middleware/index.js';
/**
 * Router de permisos
 *
 * Todas las rutas están bajo el prefijo /api/v1/organizations/:organizationId/permisos
 * Requiere autenticación y acceso a la organización (middleware requireOrganizationAccess)
 */
const permisoRouter = Router({ mergeParams: true });
/**
 * POST /api/v1/organizations/:organizationId/permisos
 * Crea un nuevo permiso.
 * Solo los administradores pueden crear permisos.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Body:
 * - prestadorId: UUID (requerido)
 * - actividadId: UUID (requerido)
 * - validFrom: string ISO DateTime (requerido)
 * - validTo: string ISO DateTime (requerido)
 * - status: 'activo' | 'inactivo' | 'vencido' | 'suspendido' (opcional, default: 'activo')
 * - documentUrl: string URL (opcional)
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: Permiso con relaciones PrestadorProfile y Actividad,
 *   message: "Permiso creado exitosamente"
 * }
 */
permisoRouter.post('/', authenticate, requireOrganizationAccess, requireAdmin, validateCreatePermiso, createPermiso);
/**
 * GET /api/v1/organizations/:organizationId/permisos
 * Lista permisos con paginación y filtros.
 * Requiere prestadorId en los query params para filtrar por prestador.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Query:
 * - prestadorId: UUID (requerido) - ID del prestador para filtrar permisos
 * - page: number (default 1)
 * - limit: number (default 20, max 100)
 * - sortBy: 'validFrom' | 'validTo' | 'status' | 'createdAt' | 'updatedAt' (opcional)
 * - sortOrder: 'asc' | 'desc' (default 'desc')
 * - actividadId: UUID (opcional, filtro por actividad)
 * - status: 'activo' | 'inactivo' | 'vencido' | 'suspendido' (opcional, filtro)
 * - validFrom: string ISO DateTime (opcional, filtro de fecha mínima)
 * - validTo: string ISO DateTime (opcional, filtro de fecha máxima)
 * - documentUrl: string (opcional, búsqueda parcial)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Permiso[] con relaciones PrestadorProfile y Actividad,
 *   pagination: { page, limit, total, totalPages },
 *   message: "Permisos obtenidos exitosamente"
 * }
 */
permisoRouter.get('/', authenticate, requireOrganizationAccess, validateListPermisos, listPermisos);
/**
 * GET /api/v1/organizations/:organizationId/permisos/:permisoId
 * Obtiene un permiso por ID.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - permisoId: UUID
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Permiso con relaciones PrestadorProfile y Actividad,
 *   message: "Permiso obtenido exitosamente"
 * }
 */
permisoRouter.get('/:permisoId', authenticate, requireOrganizationAccess, getPermisoById);
/**
 * PATCH /api/v1/organizations/:organizationId/permisos/:permisoId
 * Actualiza un permiso existente.
 * Solo los administradores pueden actualizar permisos.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - permisoId: UUID
 *
 * Body (al menos uno requerido):
 * - validFrom: string ISO DateTime (opcional)
 * - validTo: string ISO DateTime (opcional)
 * - status: 'activo' | 'inactivo' | 'vencido' | 'suspendido' (opcional)
 * - documentUrl: string URL | null (opcional)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Permiso actualizado con relaciones PrestadorProfile y Actividad,
 *   message: "Permiso actualizado exitosamente"
 * }
 */
permisoRouter.patch('/:permisoId', authenticate, requireOrganizationAccess, requireAdmin, validateUpdatePermiso, updatePermiso);
export default permisoRouter;
//# sourceMappingURL=permiso.routes.js.map