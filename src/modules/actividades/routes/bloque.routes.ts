import type { Request, Response, NextFunction } from 'express';
import { Router, type Router as ExpressRouter } from 'express';
import {
  createBloque,
  createBloqueFromTemplate,
  getBloqueById,
  listBloques,
  listBloquesByActividad,
  updateBloque,
  deleteBloque,
} from '../controllers/bloque.controller.js';
import {
  validateCreateBloque,
  validateCreateBloqueFromTemplate,
  validateUpdateBloque,
  validateListBloques,
} from '../middleware/validation.middleware.js';
import {
  authenticate,
  requireOrganizationAccess,
  requireAdmin,
} from '@/shared/middleware/index.js';

/**
 * Router de bloques (rutas generales)
 *
 * Rutas bajo el prefijo /api/v1/organizations/:organizationId/bloques
 * Requiere autenticación y acceso a la organización (middleware requireOrganizationAccess)
 */
const bloqueRouter: ExpressRouter = Router({ mergeParams: true });

/**
 * POST /api/v1/organizations/:organizationId/bloques/from-template
 * Crea un bloque desde una plantilla.
 * Solo los administradores pueden crear bloques desde plantillas.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Body:
 * - templateId: UUID (requerido, ID del bloque plantilla)
 * - date: string YYYY-MM-DD (requerido, fecha específica para el nuevo bloque)
 * - capacity: number (opcional, si no se proporciona usa la de la plantilla)
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: Bloque,
 *   message: "Bloque creado desde plantilla exitosamente"
 * }
 */
bloqueRouter.post(
  '/from-template',
  authenticate,
  requireOrganizationAccess,
  requireAdmin,
  validateCreateBloqueFromTemplate,
  createBloqueFromTemplate
);

/**
 * GET /api/v1/organizations/:organizationId/bloques
 * Lista bloques con paginación y filtros.
 * Cualquier usuario con acceso a la organización puede listar bloques.
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
 * - sortBy: 'date' | 'startTime' | 'endTime' | 'capacity' | 'createdAt' | 'updatedAt' (opcional)
 * - sortOrder: 'asc' | 'desc' (default 'desc')
 * - actividadId: UUID (opcional, filtro)
 * - date: string YYYY-MM-DD (opcional, filtro)
 * - isTemplate: boolean (opcional, filtro)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Bloque[],
 *   pagination: { page, limit, total, totalPages },
 *   message: "Bloques obtenidos exitosamente"
 * }
 */
bloqueRouter.get('/', authenticate, requireOrganizationAccess, validateListBloques, listBloques);

/**
 * GET /api/v1/organizations/:organizationId/bloques/:bloqueId
 * Obtiene un bloque por ID.
 * Cualquier usuario con acceso a la organización puede leer bloques.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - bloqueId: UUID
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Bloque,
 *   message: "Bloque obtenido exitosamente"
 * }
 */
bloqueRouter.get('/:bloqueId', authenticate, requireOrganizationAccess, getBloqueById);

/**
 * PATCH /api/v1/organizations/:organizationId/bloques/:bloqueId
 * Actualiza un bloque existente.
 * Solo los administradores pueden actualizar bloques.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - bloqueId: UUID
 *
 * Body (al menos uno requerido):
 * - date: string YYYY-MM-DD | null (opcional)
 * - startTime: string HH:mm:ss (opcional)
 * - endTime: string HH:mm:ss (opcional)
 * - capacity: number (opcional, mínimo: 1)
 * - isTemplate: boolean (opcional)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Bloque actualizado,
 *   message: "Bloque actualizado exitosamente"
 * }
 */
bloqueRouter.patch(
  '/:bloqueId',
  authenticate,
  requireOrganizationAccess,
  requireAdmin,
  validateUpdateBloque,
  updateBloque
);

/**
 * DELETE /api/v1/organizations/:organizationId/bloques/:bloqueId
 * Elimina un bloque.
 * Solo los administradores pueden eliminar bloques.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - bloqueId: UUID
 *
 * Respuesta 204: No Content
 */
bloqueRouter.delete(
  '/:bloqueId',
  authenticate,
  requireOrganizationAccess,
  requireAdmin,
  deleteBloque
);

/**
 * Router de bloques anidados en actividades
 *
 * Rutas bajo el prefijo /api/v1/organizations/:organizationId/actividades/:actividadId/bloques
 * Requiere autenticación y acceso a la organización (middleware requireOrganizationAccess)
 */
const bloqueActividadRouter: ExpressRouter = Router({ mergeParams: true });

/**
 * Middleware para inyectar actividadId desde params al body
 * (para rutas anidadas bajo actividades)
 */
const injectActividadIdFromParams = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.params['actividadId']) {
    req.body = {
      ...req.body,
      actividadId: req.params['actividadId'],
    };
  }
  next();
};

/**
 * POST /api/v1/organizations/:organizationId/actividades/:actividadId/bloques
 * Crea un nuevo bloque para una actividad específica.
 * Solo los administradores pueden crear bloques.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - actividadId: UUID
 *
 * Body:
 * - date: string YYYY-MM-DD (requerido si isTemplate=false, null si isTemplate=true)
 * - startTime: string HH:mm:ss (requerido)
 * - endTime: string HH:mm:ss (requerido)
 * - capacity: number (opcional, default: 1, mínimo: 1)
 * - isTemplate: boolean (opcional, default: false)
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: Bloque,
 *   message: "Bloque creado exitosamente"
 * }
 */
bloqueActividadRouter.post(
  '/',
  authenticate,
  requireOrganizationAccess,
  requireAdmin,
  injectActividadIdFromParams,
  validateCreateBloque,
  createBloque
);

/**
 * GET /api/v1/organizations/:organizationId/actividades/:actividadId/bloques
 * Lista bloques de una actividad específica.
 * Cualquier usuario con acceso a la organización puede listar bloques.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - actividadId: UUID
 *
 * Query:
 * - page: number (default 1)
 * - limit: number (default 20, max 100)
 * - sortBy: 'date' | 'startTime' | 'endTime' | 'capacity' | 'createdAt' | 'updatedAt' (opcional)
 * - sortOrder: 'asc' | 'desc' (default 'desc')
 * - date: string YYYY-MM-DD (opcional, filtro)
 * - isTemplate: boolean (opcional, filtro)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Bloque[],
 *   pagination: { page, limit, total, totalPages },
 *   message: "Bloques obtenidos exitosamente"
 * }
 */
bloqueActividadRouter.get(
  '/',
  authenticate,
  requireOrganizationAccess,
  validateListBloques,
  listBloquesByActividad
);

export default bloqueRouter;
export { bloqueActividadRouter };
