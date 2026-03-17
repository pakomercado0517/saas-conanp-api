import * as prestadorProfileService from '../services/prestador-profile.service.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../../shared/responses/helpers.js';
/**
 * Crea un nuevo perfil de prestador.
 * Solo los administradores pueden crear perfiles de prestador.
 *
 * POST /api/v1/organizations/:organizationId/prestadores
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Body:
 * - userId: UUID (requerido)
 * - status: 'activo' | 'inactivo' | 'suspendido' (opcional, default: 'activo')
 * - permitExpiresAt: string ISO DateTime (opcional)
 *
 * Respuesta 201:
 * {
 *   success: true,
 *   data: PrestadorProfile con relaciones User y Organization,
 *   message: "Perfil de prestador creado exitosamente"
 * }
 */
export const createPrestadorProfile = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const userId = req.user.userId;
    const data = req.body;
    // Asegurar que organizationId del body coincida con el del parámetro
    const prestadorData = {
        ...data,
        organizationId,
    };
    const profile = await prestadorProfileService.createPrestadorProfile(prestadorData, userId);
    return sendCreated(res, profile, 'Perfil de prestador creado exitosamente');
};
/**
 * Obtiene un perfil de prestador por ID.
 * - Los administradores pueden ver cualquier perfil
 * - Los prestadores solo pueden ver su propio perfil
 *
 * GET /api/v1/organizations/:organizationId/prestadores/:prestadorId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - prestadorId: UUID
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: PrestadorProfile con relaciones User y Organization,
 *   message: "Perfil de prestador obtenido exitosamente"
 * }
 */
export const getPrestadorProfileById = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const prestadorId = req.params['prestadorId'];
    const userId = req.user.userId;
    const profile = await prestadorProfileService.getPrestadorProfileById(prestadorId, organizationId, userId);
    return sendSuccess(res, profile, 'Perfil de prestador obtenido exitosamente');
};
/**
 * Lista prestadores con paginación y filtros.
 * - Los administradores pueden ver todos los prestadores
 * - Los prestadores solo pueden ver su propio perfil
 *
 * GET /api/v1/organizations/:organizationId/prestadores
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
 * - sortBy: 'status' | 'permitExpiresAt' | 'createdAt' | 'updatedAt' (opcional)
 * - sortOrder: 'asc' | 'desc' (default 'desc')
 * - status: 'activo' | 'inactivo' | 'suspendido' (opcional, filtro)
 * - userId: UUID (opcional, filtro por usuario)
 * - permitExpiresAt: string ISO DateTime (opcional, filtro)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: PrestadorProfile[] con relaciones User y Organization,
 *   pagination: { page, limit, total, totalPages },
 *   message: "Prestadores obtenidos exitosamente"
 * }
 */
export const listPrestadores = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const userId = req.user.userId;
    // Usar validatedQuery si existe (cuando hay middleware de validación), sino usar req.query
    const filters = req.validatedQuery ??
        req.query;
    const result = await prestadorProfileService.listPrestadores(organizationId, filters, userId);
    return sendPaginated(res, result.data, result.pagination, 'Prestadores obtenidos exitosamente');
};
/**
 * Actualiza un perfil de prestador existente.
 * - Los administradores pueden actualizar cualquier perfil
 * - Los prestadores solo pueden actualizar su propio perfil
 *
 * PATCH /api/v1/organizations/:organizationId/prestadores/:prestadorId
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - prestadorId: UUID
 *
 * Body (al menos uno requerido):
 * - status: 'activo' | 'inactivo' | 'suspendido' (opcional)
 * - permitExpiresAt: string ISO DateTime | null (opcional)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: PrestadorProfile actualizado con relaciones User y Organization,
 *   message: "Perfil de prestador actualizado exitosamente"
 * }
 */
export const updatePrestadorProfile = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const prestadorId = req.params['prestadorId'];
    const userId = req.user.userId;
    const data = req.body;
    const profile = await prestadorProfileService.updatePrestadorProfile(prestadorId, organizationId, data, userId);
    return sendSuccess(res, profile, 'Perfil de prestador actualizado exitosamente');
};
/**
 * Crea un prestador completo (usuario + membership + perfil + activos opcionales)
 * en una sola operación.
 *
 * POST /api/v1/organizations/:organizationId/prestadores/crear-completo
 */
export const createPrestadorCompleto = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const userId = req.user.userId;
    const data = req.body;
    const result = await prestadorProfileService.createPrestadorCompleto(organizationId, data, userId);
    return sendCreated(res, result, 'Prestador completo creado exitosamente');
};
//# sourceMappingURL=prestador-profile.controller.js.map