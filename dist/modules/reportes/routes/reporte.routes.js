import { Router } from 'express';
import { getReporteEventosPorActividad, getReporteEventosPorPrestador, getReporteEventosPorFecha, getReporteCapacidadUtilizada, getReportePrestadoresActivos, } from '../controllers/reporte.controller.js';
import { validateReporteEventosPorActividad, validateReporteEventosPorPrestador, validateReporteEventosPorFecha, validateReporteCapacidadUtilizada, validateReportePrestadoresActivos, } from '../middleware/validation.middleware.js';
import { authenticate, requireOrganizationAccess, requireAdmin, } from '../../../shared/middleware/index.js';
/**
 * Router de reportes
 *
 * Todas las rutas están bajo el prefijo /api/v1/organizations/:organizationId/reportes
 * Requiere autenticación, acceso a la organización y rol de administrador (middleware requireAdmin)
 */
const reporteRouter = Router({ mergeParams: true });
/**
 * GET /api/v1/organizations/:organizationId/reportes/eventos-por-actividad
 * Obtiene reporte de eventos agrupados por actividad.
 * Solo los administradores pueden acceder a este reporte.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Query:
 * - actividadId: UUID (opcional, filtro por actividad específica)
 * - dateFrom: string YYYY-MM-DD (opcional, fecha de inicio del rango)
 * - dateTo: string YYYY-MM-DD (opcional, fecha de fin del rango)
 * - status: 'programado' | 'en_curso' | 'completado' | 'cancelado' (opcional, filtro por estado)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: ReporteEventosPorActividadItem[],
 *   message: "Reporte obtenido exitosamente",
 *   timestamp: "2026-01-26T10:30:00.000Z"
 * }
 */
reporteRouter.get('/eventos-por-actividad', authenticate, requireOrganizationAccess, requireAdmin, validateReporteEventosPorActividad, getReporteEventosPorActividad);
/**
 * GET /api/v1/organizations/:organizationId/reportes/eventos-por-prestador
 * Obtiene reporte de eventos agrupados por prestador.
 * Solo los administradores pueden acceder a este reporte.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Query:
 * - prestadorId: UUID (opcional, filtro por prestador específico)
 * - dateFrom: string YYYY-MM-DD (opcional, fecha de inicio del rango)
 * - dateTo: string YYYY-MM-DD (opcional, fecha de fin del rango)
 * - status: 'programado' | 'en_curso' | 'completado' | 'cancelado' (opcional, filtro por estado)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: ReporteEventosPorPrestadorItem[],
 *   message: "Reporte obtenido exitosamente",
 *   timestamp: "2026-01-26T10:30:00.000Z"
 * }
 */
reporteRouter.get('/eventos-por-prestador', authenticate, requireOrganizationAccess, requireAdmin, validateReporteEventosPorPrestador, getReporteEventosPorPrestador);
/**
 * GET /api/v1/organizations/:organizationId/reportes/eventos-por-fecha
 * Obtiene reporte de eventos agrupados por fecha.
 * Solo los administradores pueden acceder a este reporte.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Query:
 * - dateFrom: string YYYY-MM-DD (requerido si no hay dateTo, fecha de inicio del rango)
 * - dateTo: string YYYY-MM-DD (requerido si no hay dateFrom, fecha de fin del rango)
 * - actividadId: UUID (opcional, filtro por actividad específica)
 * - prestadorId: UUID (opcional, filtro por prestador específico)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: ReporteEventosPorFechaItem[],
 *   message: "Reporte obtenido exitosamente",
 *   timestamp: "2026-01-26T10:30:00.000Z"
 * }
 */
reporteRouter.get('/eventos-por-fecha', authenticate, requireOrganizationAccess, requireAdmin, validateReporteEventosPorFecha, getReporteEventosPorFecha);
/**
 * GET /api/v1/organizations/:organizationId/reportes/capacidad-utilizada
 * Obtiene reporte de capacidad utilizada.
 * Solo los administradores pueden acceder a este reporte.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Query:
 * - actividadId: UUID (opcional, filtro por actividad específica)
 * - dateFrom: string YYYY-MM-DD (opcional, fecha de inicio del rango)
 * - dateTo: string YYYY-MM-DD (opcional, fecha de fin del rango)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: ReporteCapacidadUtilizadaItem[],
 *   message: "Reporte obtenido exitosamente",
 *   timestamp: "2026-01-26T10:30:00.000Z"
 * }
 */
reporteRouter.get('/capacidad-utilizada', authenticate, requireOrganizationAccess, requireAdmin, validateReporteCapacidadUtilizada, getReporteCapacidadUtilizada);
/**
 * GET /api/v1/organizations/:organizationId/reportes/prestadores-activos
 * Obtiene reporte de prestadores activos.
 * Solo los administradores pueden acceder a este reporte.
 *
 * Headers:
 * - Authorization: Bearer <accessToken>
 *
 * Params:
 * - organizationId: UUID
 *
 * Query:
 * - status: 'activo' | 'inactivo' | 'suspendido' (opcional, default: 'activo')
 * - conPermisosVigentes: boolean (opcional, default: false, filtrar solo prestadores con permisos vigentes)
 *
 * Respuesta 200:
 * {
 *   success: true,
 *   data: ReportePrestadoresActivosItem[],
 *   message: "Reporte obtenido exitosamente",
 *   timestamp: "2026-01-26T10:30:00.000Z"
 * }
 */
reporteRouter.get('/prestadores-activos', authenticate, requireOrganizationAccess, requireAdmin, validateReportePrestadoresActivos, getReportePrestadoresActivos);
export default reporteRouter;
//# sourceMappingURL=reporte.routes.js.map