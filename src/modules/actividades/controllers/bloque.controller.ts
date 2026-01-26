import type { Request, Response } from 'express';
import * as bloqueService from '../services/bloque.service.js';
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendNoContent,
} from '@/shared/responses/helpers.js';
import type {
  CreateBloqueDTO,
  CreateBloqueFromTemplateDTO,
  UpdateBloqueDTO,
  ListBloquesDTO,
} from '../validators/bloque.validator.js';

/**
 * Crea un nuevo bloque.
 * Solo los administradores pueden crear bloques.
 *
 * POST /api/v1/organizations/:organizationId/actividades/:actividadId/bloques
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - actividadId: UUID
 *
 * Body:
 * - actividadId: UUID (requerido)
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
export const createBloque = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const userId = req.user.userId;
  const data = req.body as CreateBloqueDTO;

  // Si actividadId viene en params (ruta anidada), usarlo en lugar del body
  const actividadId = (req.params['actividadId'] as string | undefined) || data.actividadId;

  // Asegurar que organizationId del body coincida con el del parámetro
  const bloqueData: CreateBloqueDTO = {
    ...data,
    organizationId,
    actividadId,
  };

  const bloque = await bloqueService.createBloque(bloqueData, userId);

  return sendCreated(res, bloque, 'Bloque creado exitosamente');
};

/**
 * Crea un bloque desde una plantilla.
 * Solo los administradores pueden crear bloques desde plantillas.
 *
 * POST /api/v1/organizations/:organizationId/bloques/from-template
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
export const createBloqueFromTemplate = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const userId = req.user.userId;
  const data = req.body as CreateBloqueFromTemplateDTO;

  const bloque = await bloqueService.createBloqueFromTemplate(data, organizationId, userId);

  return sendCreated(res, bloque, 'Bloque creado desde plantilla exitosamente');
};

/**
 * Obtiene un bloque por ID.
 * Cualquier usuario con acceso a la organización puede leer bloques.
 *
 * GET /api/v1/organizations/:organizationId/bloques/:bloqueId
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
export const getBloqueById = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const bloqueId = req.params['bloqueId'] as string;
  const userId = req.user.userId;

  const bloque = await bloqueService.getBloqueById(bloqueId, organizationId, userId);

  return sendSuccess(res, bloque, 'Bloque obtenido exitosamente');
};

/**
 * Lista bloques con paginación y filtros.
 * Cualquier usuario con acceso a la organización puede listar bloques.
 *
 * GET /api/v1/organizations/:organizationId/bloques
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
export const listBloques = async (req: Request, res: Response): Promise<Response> => {
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
    (req.validatedQuery as ListBloquesDTO | undefined) ?? (req.query as unknown as ListBloquesDTO);

  const result = await bloqueService.listBloques(organizationId, filters, userId);

  return sendPaginated(res, result.data, result.pagination, 'Bloques obtenidos exitosamente');
};

/**
 * Lista bloques de una actividad específica.
 * Cualquier usuario con acceso a la organización puede listar bloques.
 *
 * GET /api/v1/organizations/:organizationId/actividades/:actividadId/bloques
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
export const listBloquesByActividad = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const actividadId = req.params['actividadId'] as string;
  const userId = req.user.userId;
  // Usar validatedQuery si existe (cuando hay middleware de validación), sino usar req.query
  const filters =
    (req.validatedQuery as Omit<ListBloquesDTO, 'actividadId' | 'organizationId'> | undefined) ??
    (req.query as unknown as Omit<ListBloquesDTO, 'actividadId' | 'organizationId'>);

  const result = await bloqueService.listBloquesByActividad(
    actividadId,
    organizationId,
    filters,
    userId
  );

  return sendPaginated(res, result.data, result.pagination, 'Bloques obtenidos exitosamente');
};

/**
 * Actualiza un bloque existente.
 * Solo los administradores pueden actualizar bloques.
 *
 * PATCH /api/v1/organizations/:organizationId/bloques/:bloqueId
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
export const updateBloque = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const bloqueId = req.params['bloqueId'] as string;
  const userId = req.user.userId;
  const data = req.body as UpdateBloqueDTO;

  const bloque = await bloqueService.updateBloque(bloqueId, organizationId, data, userId);

  return sendSuccess(res, bloque, 'Bloque actualizado exitosamente');
};

/**
 * Elimina un bloque.
 * Solo los administradores pueden eliminar bloques.
 *
 * DELETE /api/v1/organizations/:organizationId/bloques/:bloqueId
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
export const deleteBloque = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const bloqueId = req.params['bloqueId'] as string;
  const userId = req.user.userId;

  await bloqueService.deleteBloque(bloqueId, organizationId, userId);

  return sendNoContent(res);
};
