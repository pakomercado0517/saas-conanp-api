import { Router } from 'express';
import { createRequisito, listRequisitos, updateRequisito, deleteRequisito, } from '../controllers/activo-requisito.controller.js';
import { validateCreateActivoRequisito, validateUpdateActivoRequisito, validateListActivoRequisitos, } from '../middleware/validation.middleware.js';
import { authenticate, requireOrganizationAccess, requireAdmin, } from '../../../shared/middleware/index.js';
/**
 * Router de requisitos de activos
 *
 * Todas las rutas están bajo el prefijo /api/v1/organizations/:organizationId/activos/:activoId/requisitos
 * Requiere autenticación y acceso a la organización (middleware requireOrganizationAccess)
 * El activoId viene del parámetro de ruta del router padre
 */
const activoRequisitoRouter = Router({ mergeParams: true });
/**
 * POST /api/v1/organizations/:organizationId/activos/:activoId/requisitos
 * Crea un requisito de activo.
 * Solo los administradores pueden crear requisitos.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - activoId: UUID
 *
 * Body:
 * - key: string (requerido, 1-255 caracteres)
 * - value: string (opcional, nullable)
 * - documentUrl: string URL http/https (opcional, nullable)
 * - validated: boolean (opcional, default: false)
 *
 * Nota: El activoId se inyecta automáticamente desde el parámetro de ruta.
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: ActivoRequisito con relación Activo,
 *   message: "Requisito de activo creado exitosamente"
 * }
 */
activoRequisitoRouter.post('/', authenticate, requireOrganizationAccess, requireAdmin, validateCreateActivoRequisito, createRequisito);
/**
 * GET /api/v1/organizations/:organizationId/activos/:activoId/requisitos
 * Lista requisitos de un activo con paginación y filtros.
 * Cualquier usuario con acceso a la organización puede listar requisitos.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - activoId: UUID
 *
 * Query:
 * - page: number (default 1)
 * - limit: number (default 20, max 100)
 * - sortBy: 'key' | 'validated' | 'createdAt' | 'updatedAt' (opcional)
 * - sortOrder: 'asc' | 'desc' (default 'asc')
 * - validated: boolean (opcional, filtro)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: ActivoRequisito[] con relación Activo,
 *   pagination: { page, limit, total, totalPages },
 *   message: "Requisitos obtenidos exitosamente"
 * }
 */
activoRequisitoRouter.get('/', authenticate, requireOrganizationAccess, validateListActivoRequisitos, listRequisitos);
/**
 * PATCH /api/v1/organizations/:organizationId/activos/:activoId/requisitos/:requisitoId
 * Actualiza un requisito de activo.
 * Solo se pueden actualizar value, documentUrl y validated (no key).
 * Solo los administradores pueden actualizar requisitos.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - activoId: UUID
 * - requisitoId: UUID
 *
 * Body (al menos uno requerido):
 * - value: string (opcional, nullable)
 * - documentUrl: string URL http/https (opcional, nullable)
 * - validated: boolean (opcional)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: ActivoRequisito actualizado con relación Activo,
 *   message: "Requisito de activo actualizado exitosamente"
 * }
 */
activoRequisitoRouter.patch('/:requisitoId', authenticate, requireOrganizationAccess, requireAdmin, validateUpdateActivoRequisito, updateRequisito);
/**
 * DELETE /api/v1/organizations/:organizationId/activos/:activoId/requisitos/:requisitoId
 * Elimina un requisito de activo (hard delete).
 * Solo los administradores pueden eliminar requisitos.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - activoId: UUID
 * - requisitoId: UUID
 *
 * Respuesta 204: No Content
 */
activoRequisitoRouter.delete('/:requisitoId', authenticate, requireOrganizationAccess, requireAdmin, deleteRequisito);
export default activoRequisitoRouter;
//# sourceMappingURL=activo-requisito.routes.js.map