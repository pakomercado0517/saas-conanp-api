import { Router } from 'express';
import { createPrestadorProfile, getPrestadorProfileById, listPrestadores, updatePrestadorProfile, } from '../controllers/prestador-profile.controller.js';
import { validateCreatePrestadorProfile, validateUpdatePrestadorProfile, validateListPrestadores, } from '../middleware/validation.middleware.js';
import { authenticate, requireOrganizationAccess, requireAdmin, } from '@/shared/middleware/index.js';
/**
 * Router de prestadores
 *
 * Todas las rutas están bajo el prefijo /api/v1/organizations/:organizationId/prestadores
 * Requiere autenticación y acceso a la organización (middleware requireOrganizationAccess)
 */
const prestadorRouter = Router({ mergeParams: true });
/**
 * POST /api/v1/organizations/:organizationId/prestadores
 * Crea un nuevo perfil de prestador.
 * Solo los administradores pueden crear perfiles de prestador.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Body:
 * - userId: UUID (requerido)
 * - status: 'activo' | 'inactivo' | 'suspendido' (opcional, default: 'activo')
 * - permitExpiresAt: string ISO DateTime (opcional)
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: PrestadorProfile con relaciones User y Organization,
 *   message: "Perfil de prestador creado exitosamente"
 * }
 */
prestadorRouter.post('/', authenticate, requireOrganizationAccess, requireAdmin, validateCreatePrestadorProfile, createPrestadorProfile);
/**
 * GET /api/v1/organizations/:organizationId/prestadores
 * Lista prestadores con paginación y filtros.
 * - Los administradores pueden ver todos los prestadores
 * - Los prestadores solo pueden ver su propio perfil
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
 * - sortBy: 'status' | 'permitExpiresAt' | 'createdAt' | 'updatedAt' (opcional)
 * - sortOrder: 'asc' | 'desc' (default 'desc')
 * - status: 'activo' | 'inactivo' | 'suspendido' (opcional, filtro)
 * - userId: UUID (opcional, filtro por usuario)
 * - permitExpiresAt: string ISO DateTime (opcional, filtro)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: PrestadorProfile[] con relaciones User y Organization,
 *   pagination: { page, limit, total, totalPages },
 *   message: "Prestadores obtenidos exitosamente"
 * }
 */
prestadorRouter.get('/', authenticate, requireOrganizationAccess, validateListPrestadores, listPrestadores);
/**
 * GET /api/v1/organizations/:organizationId/prestadores/:prestadorId
 * Obtiene un perfil de prestador por ID.
 * - Los administradores pueden ver cualquier perfil
 * - Los prestadores solo pueden ver su propio perfil
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - prestadorId: UUID
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: PrestadorProfile con relaciones User y Organization,
 *   message: "Perfil de prestador obtenido exitosamente"
 * }
 */
prestadorRouter.get('/:prestadorId', authenticate, requireOrganizationAccess, getPrestadorProfileById);
/**
 * PATCH /api/v1/organizations/:organizationId/prestadores/:prestadorId
 * Actualiza un perfil de prestador existente.
 * - Los administradores pueden actualizar cualquier perfil
 * - Los prestadores solo pueden actualizar su propio perfil
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - prestadorId: UUID
 *
 * Body (al menos uno requerido):
 * - status: 'activo' | 'inactivo' | 'suspendido' (opcional)
 * - permitExpiresAt: string ISO DateTime | null (opcional)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: PrestadorProfile actualizado con relaciones User y Organization,
 *   message: "Perfil de prestador actualizado exitosamente"
 * }
 */
prestadorRouter.patch('/:prestadorId', authenticate, requireOrganizationAccess, validateUpdatePrestadorProfile, updatePrestadorProfile);
export default prestadorRouter;
//# sourceMappingURL=prestador-profile.routes.js.map