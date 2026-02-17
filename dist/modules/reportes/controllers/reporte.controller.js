import * as reporteService from '../services/reporte.service.js';
import { sendSuccess } from '../../../shared/responses/helpers.js';
/**
 * Obtiene reporte de eventos agrupados por actividad.
 *
 * GET /api/v1/organizations/:organizationId/reportes/eventos-por-actividad
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
export const getReporteEventosPorActividad = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const userId = req.user.userId;
    const filters = req.validatedQuery ??
        req.query;
    const resultado = await reporteService.getReporteEventosPorActividad(organizationId, filters, userId);
    return sendSuccess(res, resultado, 'Reporte obtenido exitosamente');
};
/**
 * Obtiene reporte de eventos agrupados por prestador.
 *
 * GET /api/v1/organizations/:organizationId/reportes/eventos-por-prestador
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
export const getReporteEventosPorPrestador = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const userId = req.user.userId;
    const filters = req.validatedQuery ??
        req.query;
    const resultado = await reporteService.getReporteEventosPorPrestador(organizationId, filters, userId);
    return sendSuccess(res, resultado, 'Reporte obtenido exitosamente');
};
/**
 * Obtiene reporte de eventos agrupados por fecha.
 *
 * GET /api/v1/organizations/:organizationId/reportes/eventos-por-fecha
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
export const getReporteEventosPorFecha = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const userId = req.user.userId;
    const filters = req.validatedQuery ??
        req.query;
    const resultado = await reporteService.getReporteEventosPorFecha(organizationId, filters, userId);
    return sendSuccess(res, resultado, 'Reporte obtenido exitosamente');
};
/**
 * Obtiene reporte de capacidad utilizada.
 *
 * GET /api/v1/organizations/:organizationId/reportes/capacidad-utilizada
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
export const getReporteCapacidadUtilizada = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const userId = req.user.userId;
    const filters = req.validatedQuery ??
        req.query;
    const resultado = await reporteService.getReporteCapacidadUtilizada(organizationId, filters, userId);
    return sendSuccess(res, resultado, 'Reporte obtenido exitosamente');
};
/**
 * Obtiene reporte de prestadores activos.
 *
 * GET /api/v1/organizations/:organizationId/reportes/prestadores-activos
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
export const getReportePrestadoresActivos = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const userId = req.user.userId;
    const filters = req.validatedQuery ??
        req.query;
    const resultado = await reporteService.getReportePrestadoresActivos(organizationId, filters, userId);
    return sendSuccess(res, resultado, 'Reporte obtenido exitosamente');
};
/**
 * GET /api/v1/organizations/:organizationId/reportes/stock-acceso
 * Reporte de stock actual por producto. Solo admins.
 */
export const getReporteStockActual = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const userId = req.user.userId;
    const filters = req.validatedQuery ?? {};
    const resultado = await reporteService.getReporteStockActual(organizationId, filters, userId);
    return sendSuccess(res, resultado, 'Reporte obtenido exitosamente');
};
/**
 * GET /api/v1/organizations/:organizationId/reportes/salidas-stock
 * Reporte de salidas de stock por período. Solo admins.
 */
export const getReporteSalidasStock = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const userId = req.user.userId;
    const filters = req.validatedQuery ??
        req.query;
    const resultado = await reporteService.getReporteSalidasPorPeriodo(organizationId, filters, userId);
    return sendSuccess(res, resultado, 'Reporte obtenido exitosamente');
};
/**
 * GET /api/v1/organizations/:organizationId/reportes/ventas-prestadores
 * Reporte de ventas agrupadas por prestador. Solo admins.
 */
export const getReporteVentasPrestadores = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const userId = req.user.userId;
    const filters = req.validatedQuery ??
        req.query;
    const resultado = await reporteService.getReporteVentasPorPrestador(organizationId, filters, userId);
    return sendSuccess(res, resultado, 'Reporte obtenido exitosamente');
};
/**
 * GET /api/v1/organizations/:organizationId/reportes/ventas-por-producto
 * Reporte de ventas por producto y fecha. Solo admins.
 */
export const getReporteVentasPorProducto = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado',
            message: 'Token de autenticación requerido',
        });
    }
    const organizationId = req.organizationId;
    const userId = req.user.userId;
    const filters = req.validatedQuery ??
        req.query;
    const resultado = await reporteService.getReporteVentasPorProducto(organizationId, filters, userId);
    return sendSuccess(res, resultado, 'Reporte obtenido exitosamente');
};
//# sourceMappingURL=reporte.controller.js.map