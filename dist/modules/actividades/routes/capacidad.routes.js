import { Router } from 'express';
import { createOrUpdateCapacidad, verificarDisponibilidad, } from '../controllers/capacidad.controller.js';
import { validateCreateCapacidad, validateVerificarDisponibilidad, } from '../middleware/validation.middleware.js';
import { authenticate, requireOrganizationAccess, requireAdmin, } from '../../../shared/middleware/index.js';
/**
 * Router de capacidad anidado en actividades
 *
 * Rutas bajo el prefijo /api/v1/organizations/:organizationId/actividades/:actividadId/capacidad
 * Requiere autenticación y acceso a la organización (middleware requireOrganizationAccess)
 */
const capacidadActividadRouter = Router({ mergeParams: true });
/**
 * POST /api/v1/organizations/:organizationId/actividades/:actividadId/capacidad
 * Crea o actualiza una capacidad para una actividad y fecha.
 * Si ya existe una capacidad para esa actividad y fecha, la actualiza.
 * Solo los administradores pueden crear/actualizar capacidades.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - actividadId: UUID
 *
 * Body:
 * - date: string YYYY-MM-DD (requerido)
 * - limit: number (requerido, mínimo: 1)
 *
 * Respuesta 201 (creada) o 200 (actualizada):
 * {
 *   success: true,
 *   data: Capacidad,
 *   message: "Capacidad creada/actualizada exitosamente"
 * }
 */
capacidadActividadRouter.post('/', authenticate, requireOrganizationAccess, requireAdmin, validateCreateCapacidad, createOrUpdateCapacidad);
/**
 * GET /api/v1/organizations/:organizationId/actividades/:actividadId/capacidad/verificar
 * Verifica disponibilidad de capacidad para una actividad.
 * Determina automáticamente si debe verificar por bloque (BLOQUES) o por día (HORARIO_LIBRE).
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 * - actividadId: UUID
 *
 * Query:
 * - date: string YYYY-MM-DD (requerido)
 * - bloqueId: UUID (opcional, requerido si agendaType = BLOQUES)
 * - cantidad: number (opcional, default: 1, mínimo: 1)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: {
 *     disponible: boolean,
 *     capacidadTotal: number,
 *     capacidadUsada: number,
 *     capacidadDisponible: number,
 *     limite: number
 *   },
 *   message: "Disponibilidad verificada exitosamente"
 * }
 */
capacidadActividadRouter.get('/verificar', authenticate, requireOrganizationAccess, validateVerificarDisponibilidad, verificarDisponibilidad);
export default capacidadActividadRouter;
//# sourceMappingURL=capacidad.routes.js.map