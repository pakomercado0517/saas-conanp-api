import type { Request, Response } from 'express';
/**
 * Crea una nueva evidencia ambiental asociada a un evento.
 *
 * POST /api/v1/organizations/:organizationId/eventos/:eventoId/evidencias
 */
export declare const createEvidencia: (req: Request, res: Response) => Promise<Response>;
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
export declare const getEvidenciaById: (req: Request, res: Response) => Promise<Response>;
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
export declare const listEvidencias: (req: Request, res: Response) => Promise<Response>;
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
export declare const updateEvidencia: (req: Request, res: Response) => Promise<Response>;
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
export declare const deleteEvidencia: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=evidencia.controller.d.ts.map