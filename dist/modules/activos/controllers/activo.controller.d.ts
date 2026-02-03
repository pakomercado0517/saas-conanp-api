import type { Request, Response } from 'express';
/**
 * Crea un nuevo activo.
 *
 * POST /api/v1/organizations/:organizationId/activos
 */
export declare const createActivo: (req: Request, res: Response) => Promise<Response>;
/**
 * Obtiene un activo por ID.
 *
 * GET /api/v1/organizations/:organizationId/activos/:activoId
 */
export declare const getActivoById: (req: Request, res: Response) => Promise<Response>;
/**
 * @swagger
 * /api/v1/:
 *   get:
 *     summary: Listar recursos
 *     description: Endpoint para listar recursos. Requiere autenticación. Requiere acceso a la organización.
 *     tags: [Activos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - $ref: '#/components/parameters/SortByQuery'
 *       - $ref: '#/components/parameters/SortOrderQuery'
 *     responses:
 *       200:
 *         description: Listado obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
export declare const listActivos: (req: Request, res: Response) => Promise<Response>;
/**
 * Actualiza un activo existente.
 *
 * PATCH /api/v1/organizations/:organizationId/activos/:activoId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - activoId: UUID
 *
 * Body (al menos uno requerido):
 * - type: 'embarcacion' | 'vehiculo' | 'guia' | 'equipo' (opcional)
 * - status: 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido' (opcional)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Activo actualizado con relaciones Organization y Owner,
 *   message: "Activo actualizado exitosamente"
 * }
 */
export declare const updateActivo: (req: Request, res: Response) => Promise<Response>;
/**
 * Elimina un activo (soft delete).
 *
 * DELETE /api/v1/organizations/:organizationId/activos/:activoId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - activoId: UUID
 *
 * Respuesta 204: No Content
 */
export declare const deleteActivo: (req: Request, res: Response) => Promise<Response>;
/**
 * Aprueba un activo (cambia su estado a 'aprobado').
 * Solo los administradores pueden aprobar activos.
 *
 * POST /api/v1/organizations/:organizationId/activos/:activoId/aprobar
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - activoId: UUID
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: Activo actualizado con relaciones Organization y Owner,
 *   message: "Activo aprobado exitosamente"
 * }
 */
export declare const approveActivo: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=activo.controller.d.ts.map