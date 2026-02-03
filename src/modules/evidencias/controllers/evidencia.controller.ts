import type { Request, Response } from 'express';
import * as evidenciaService from '../services/evidencia.service.js';
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendNoContent,
} from '@/shared/responses/helpers.js';
import type {
  CreateEvidenciaDTO,
  UpdateEvidenciaDTO,
  ListEvidenciasDTO,
} from '../validators/evidencia.validator.js';

/**
 * Crea una nueva evidencia ambiental asociada a un evento.
 *
 * POST /api/v1/organizations/:organizationId/eventos/:eventoId/evidencias
 */
export const createEvidencia = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const eventoId = req.params['eventoId'] as string;
  const userId = req.user.userId;
  const data = req.body as CreateEvidenciaDTO;

  const evidenciaData: CreateEvidenciaDTO = {
    ...data,
    eventoId,
  };
  const file = req.file?.buffer;
  const contentType = req.file?.mimetype;

  const evidencia = await evidenciaService.createEvidencia(
    evidenciaData,
    organizationId,
    userId,
    file,
    contentType
  );

  return sendCreated(res, evidencia, 'Evidencia creada exitosamente');
};

/**
 * @swagger
 * /api/v1/:evidenciaId:
 *   get:
 *     summary: Obtener recurso
 *     description: Endpoint para obtener recurso. Requiere autenticación. Requiere acceso a la organización.
 *     tags: [Evidencias]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: evidenciaId
 *         in: path
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/UUID'
 *     responses:
 *       200:
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
export const getEvidenciaById = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const evidenciaId = req.params['evidenciaId'] as string;
  const userId = req.user.userId;

  const evidencia = await evidenciaService.getEvidenciaById(evidenciaId, organizationId, userId);

  return sendSuccess(res, evidencia, 'Evidencia obtenida exitosamente');
};

/**
 * Lista evidencias de un evento con paginación y filtros.
 *
 * GET /api/v1/organizations/:organizationId/eventos/:eventoId/evidencias
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - eventoId: UUID
 *
 * Query:
 * - page: number (default 1)
 * - limit: number (default 20, max 100)
 * - sortBy: 'type' | 'createdAt' | 'updatedAt' (opcional)
 * - sortOrder: 'asc' | 'desc' (default 'desc')
 * - type: string (opcional, filtro por tipo)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: EvidenciaAmbiental[] con relación EventoOperativo,
 *   pagination: { page, limit, total, totalPages },
 *   message: "Evidencias obtenidas exitosamente"
 * }
 */
export const listEvidencias = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const eventoId = req.params['eventoId'] as string;
  const userId = req.user.userId;

  // Construir filtros desde query, incluyendo eventoId del param
  const filters: ListEvidenciasDTO = {
    ...((req.validatedQuery as ListEvidenciasDTO | undefined) ??
      (req.query as unknown as ListEvidenciasDTO)),
    eventoId, // El eventoId viene del param, no del query
  };

  const result = await evidenciaService.listEvidencias(organizationId, filters, userId);

  return sendPaginated(res, result.data, result.pagination, 'Evidencias obtenidas exitosamente');
};

/**
 * Actualiza una evidencia existente.
 * Permite reemplazar el archivo o actualizar otros campos.
 *
 * PATCH /api/v1/organizations/:organizationId/eventos/:eventoId/evidencias/:evidenciaId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - eventoId: UUID
 * - evidenciaId: UUID
 *
 * Body (multipart/form-data):
 * - type: string (opcional)
 * - description: string (opcional)
 * - file: File (opcional, para reemplazar archivo)
 * - fileUrl: string | null (opcional, para actualizar o eliminar URL)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: EvidenciaAmbiental actualizada con relación EventoOperativo,
 *   message: "Evidencia actualizada exitosamente"
 * }
 */
export const updateEvidencia = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const evidenciaId = req.params['evidenciaId'] as string;
  const userId = req.user.userId;

  // Construir DTO desde body
  const data: UpdateEvidenciaDTO = {};
  if (req.body['type'] !== undefined) {
    data.type = req.body['type'] as string;
  }
  if (req.body['description'] !== undefined) {
    data.description = req.body['description'] as string | null;
  }
  if (req.body['fileUrl'] !== undefined) {
    // Manejar string vacío como null
    const fileUrlValue = req.body['fileUrl'] as string;
    data.fileUrl = fileUrlValue === '' ? null : fileUrlValue;
  }

  // Si hay archivo subido (multer lo procesa y lo pone en req.file)
  let fileBuffer: Buffer | undefined;
  let contentType: string | undefined;

  if (req.file) {
    fileBuffer = req.file.buffer;
    contentType = req.file.mimetype;
  }

  const evidencia = await evidenciaService.updateEvidencia(
    evidenciaId,
    organizationId,
    data,
    userId,
    fileBuffer,
    contentType
  );

  return sendSuccess(res, evidencia, 'Evidencia actualizada exitosamente');
};

/**
 * Elimina una evidencia (hard delete).
 * También elimina el archivo asociado de R2 si existe.
 *
 * DELETE /api/v1/organizations/:organizationId/eventos/:eventoId/evidencias/:evidenciaId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - eventoId: UUID
 * - evidenciaId: UUID
 *
 * Respuesta 204: No Content
 */
export const deleteEvidencia = async (req: Request, res: Response): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const organizationId = req.organizationId!;
  const evidenciaId = req.params['evidenciaId'] as string;
  const userId = req.user.userId;

  await evidenciaService.deleteEvidencia(evidenciaId, organizationId, userId);

  return sendNoContent(res);
};
