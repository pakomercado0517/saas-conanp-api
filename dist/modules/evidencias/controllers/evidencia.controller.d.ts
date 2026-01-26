import type { Request, Response } from 'express';
/**
 * Crea una nueva evidencia ambiental asociada a un evento.
 * Permite subir un archivo o proporcionar una URL de archivo ya subido.
 *
 * POST /api/v1/organizations/:organizationId/eventos/:eventoId/evidencias
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - eventoId: UUID
 *
 * Body (multipart/form-data):
 * - type: string (requerido, 1-100 caracteres)
 * - description: string (opcional)
 * - file: File (opcional, si se sube archivo)
 * - fileUrl: string (opcional, si el archivo ya está subido)
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: EvidenciaAmbiental con relación EventoOperativo,
 *   message: "Evidencia creada exitosamente"
 * }
 */
export declare const createEvidencia: (req: Request, res: Response) => Promise<Response>;
/**
 * Obtiene una evidencia por ID.
 *
 * GET /api/v1/organizations/:organizationId/eventos/:eventoId/evidencias/:evidenciaId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - eventoId: UUID
 * - evidenciaId: UUID
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: EvidenciaAmbiental con relación EventoOperativo,
 *   message: "Evidencia obtenida exitosamente"
 * }
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