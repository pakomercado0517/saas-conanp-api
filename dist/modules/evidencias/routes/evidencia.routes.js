import { Router } from 'express';
import { createEvidencia, getEvidenciaById, listEvidencias, updateEvidencia, deleteEvidencia, } from '../controllers/evidencia.controller.js';
import { validateCreateEvidencia, validateUpdateEvidencia, validateListEvidencias, } from '../middleware/validation.middleware.js';
import { uploadFile } from '../middleware/file-upload.middleware.js';
import { authenticate, requireOrganizationAccess } from '../../../shared/middleware/index.js';
/**
 * Router de evidencias ambientales
 *
 * Todas las rutas están bajo el prefijo /api/v1/organizations/:organizationId/eventos/:eventoId/evidencias
 * Requiere autenticación y acceso a la organización (middleware requireOrganizationAccess)
 * Las evidencias pertenecen a eventos, por lo que el eventoId viene del parámetro de ruta
 */
const evidenciaRouter = Router({ mergeParams: true });
/**
 * POST /api/v1/organizations/:organizationId/eventos/:eventoId/evidencias
 * Crea una nueva evidencia ambiental asociada a un evento.
 * Permite subir un archivo o proporcionar una URL de archivo ya subido.
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
evidenciaRouter.post('/', authenticate, requireOrganizationAccess, uploadFile, validateCreateEvidencia, createEvidencia);
/**
 * GET /api/v1/organizations/:organizationId/eventos/:eventoId/evidencias
 * Lista evidencias de un evento con paginación y filtros.
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
evidenciaRouter.get('/', authenticate, requireOrganizationAccess, validateListEvidencias, listEvidencias);
/**
 * GET /api/v1/organizations/:organizationId/eventos/:eventoId/evidencias/:evidenciaId
 * Obtiene una evidencia por ID.
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
evidenciaRouter.get('/:evidenciaId', authenticate, requireOrganizationAccess, getEvidenciaById);
/**
 * PATCH /api/v1/organizations/:organizationId/eventos/:eventoId/evidencias/:evidenciaId
 * Actualiza una evidencia existente.
 * Permite reemplazar el archivo o actualizar otros campos.
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
evidenciaRouter.patch('/:evidenciaId', authenticate, requireOrganizationAccess, uploadFile, validateUpdateEvidencia, updateEvidencia);
/**
 * DELETE /api/v1/organizations/:organizationId/eventos/:eventoId/evidencias/:evidenciaId
 * Elimina una evidencia (hard delete).
 * También elimina el archivo asociado de R2 si existe.
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
evidenciaRouter.delete('/:evidenciaId', authenticate, requireOrganizationAccess, deleteEvidencia);
export default evidenciaRouter;
//# sourceMappingURL=evidencia.routes.js.map