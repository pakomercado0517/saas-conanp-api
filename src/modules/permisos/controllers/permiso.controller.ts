import type { Request, Response } from 'express';
import * as permisoService from '../services/permiso.service.js';
import { sendSuccess, sendCreated, sendPaginated } from '@/shared/responses/helpers.js';
import type {
  CreatePermisoDTO,
  UpdatePermisoDTO,
  ListPermisosDTO,
} from '../validators/permiso.validator.js';
import { ValidationError } from '@/shared/errors/index.js';

/**
 * Crea un nuevo permiso.
 *
 * POST /api/v1/organizations/:organizationId/permisos
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
export const createPermiso = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const userId = req.user.userId;
  const data = req.body as CreatePermisoDTO;

  const result = await permisoService.createPermiso(data, organizationId, userId);

  if (Array.isArray(result)) {
    const permissionGroupId = result[0]?.permissionGroupId ?? null;
    return sendCreated(
      res,
      { created: result, permissionGroupId },
      'Permisos creados exitosamente'
    );
  }

  return sendCreated(res, result, 'Permiso creado exitosamente');
};

/**
 * Obtiene un permiso por ID.
 *
 * GET /api/v1/organizations/:organizationId/permisos/:permisoId
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
export const getPermisoById = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const permisoId = req.params['permisoId'] as string;
  const userId = req.user.userId;

  const permiso = await permisoService.getPermisoById(permisoId, organizationId, userId);

  return sendSuccess(res, permiso, 'Permiso obtenido exitosamente');
};

/**
 * Lista permisos con paginación y filtros.
 * Requiere prestadorId en los query params para filtrar por prestador.
 *
 * GET /api/v1/organizations/:organizationId/permisos
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
export const listPermisos = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const userId = req.user.userId;
  // Usar validatedQuery si existe (cuando hay middleware de validación), sino usar req.query
  const filters =
    (req.validatedQuery as ListPermisosDTO | undefined) ??
    (req.query as unknown as ListPermisosDTO);

  // Validar que prestadorId esté presente (requerido para listPermisosByPrestador)
  if (!filters.prestadorId) {
    throw new ValidationError(
      'El ID de prestador (prestadorId) es requerido en los query params para listar permisos',
      undefined,
      {
        prestadorId: 'requerido',
      }
    );
  }

  const result = await permisoService.listPermisosByPrestador(
    filters.prestadorId,
    organizationId,
    filters,
    userId
  );

  return sendPaginated(res, result.data, result.pagination, 'Permisos obtenidos exitosamente');
};

/**
 * Actualiza un permiso existente.
 *
 * PATCH /api/v1/organizations/:organizationId/permisos/:permisoId
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
export const updatePermiso = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const permisoId = req.params['permisoId'] as string;
  const userId = req.user.userId;
  const data = req.body as UpdatePermisoDTO;

  const permiso = await permisoService.updatePermiso(permisoId, organizationId, data, userId);

  return sendSuccess(res, permiso, 'Permiso actualizado exitosamente');
};
