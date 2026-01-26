import type { Request, Response } from 'express';
import * as requisitoService from '../services/activo-requisito.service.js';
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendNoContent,
} from '@/shared/responses/helpers.js';
import type {
  CreateActivoRequisitoDTO,
  UpdateActivoRequisitoDTO,
  ListActivoRequisitosDTO,
} from '../validators/activo.validator.js';

/**
 * Crea un requisito de activo.
 *
 * POST /api/v1/organizations/:organizationId/activos/:activoId/requisitos
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
 * Respuesta 201:
 * {
 *   success: true,
 *   data: ActivoRequisito con relación Activo,
 *   message: "Requisito de activo creado exitosamente"
 * }
 */
export const createRequisito = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const userId = req.user.userId;
  const activoId = req.params['activoId'] as string;
  const data = req.body as CreateActivoRequisitoDTO;

  const requisitoData: CreateActivoRequisitoDTO = {
    ...data,
    activoId,
  };

  const requisito = await requisitoService.createRequisito(requisitoData, organizationId, userId);

  return sendCreated(res, requisito, 'Requisito de activo creado exitosamente');
};

/**
 * Lista requisitos de un activo con paginación y filtros.
 *
 * GET /api/v1/organizations/:organizationId/activos/:activoId/requisitos
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
export const listRequisitos = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const userId = req.user.userId;
  const activoId = req.params['activoId'] as string;
  const filters =
    (req.validatedQuery as ListActivoRequisitosDTO | undefined) ??
    (req.query as unknown as ListActivoRequisitosDTO);

  const result = await requisitoService.listRequisitosByActivo(
    activoId,
    organizationId,
    filters,
    userId
  );

  return sendPaginated(res, result.data, result.pagination, 'Requisitos obtenidos exitosamente');
};

/**
 * Actualiza un requisito de activo.
 * Solo se pueden actualizar value, documentUrl y validated (no key).
 *
 * PATCH /api/v1/organizations/:organizationId/activos/:activoId/requisitos/:requisitoId
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
export const updateRequisito = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const userId = req.user.userId;
  const requisitoId = req.params['requisitoId'] as string;
  const data = req.body as UpdateActivoRequisitoDTO;

  const requisito = await requisitoService.updateRequisito(
    requisitoId,
    organizationId,
    data,
    userId
  );

  return sendSuccess(res, requisito, 'Requisito de activo actualizado exitosamente');
};

/**
 * Elimina un requisito de activo (hard delete).
 *
 * DELETE /api/v1/organizations/:organizationId/activos/:activoId/requisitos/:requisitoId
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
export const deleteRequisito = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const userId = req.user.userId;
  const requisitoId = req.params['requisitoId'] as string;

  await requisitoService.deleteRequisito(requisitoId, organizationId, userId);

  return sendNoContent(res);
};
