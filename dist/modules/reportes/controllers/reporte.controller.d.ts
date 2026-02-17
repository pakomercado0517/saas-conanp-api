import type { Request, Response } from 'express';
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
export declare const getReporteEventosPorActividad: (req: Request, res: Response) => Promise<Response>;
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
export declare const getReporteEventosPorPrestador: (req: Request, res: Response) => Promise<Response>;
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
export declare const getReporteEventosPorFecha: (req: Request, res: Response) => Promise<Response>;
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
export declare const getReporteCapacidadUtilizada: (req: Request, res: Response) => Promise<Response>;
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
export declare const getReportePrestadoresActivos: (req: Request, res: Response) => Promise<Response>;
/**
 * GET /api/v1/organizations/:organizationId/reportes/stock-acceso
 * Reporte de stock actual por producto. Solo admins.
 */
export declare const getReporteStockActual: (req: Request, res: Response) => Promise<Response>;
/**
 * GET /api/v1/organizations/:organizationId/reportes/salidas-stock
 * Reporte de salidas de stock por período. Solo admins.
 */
export declare const getReporteSalidasStock: (req: Request, res: Response) => Promise<Response>;
/**
 * GET /api/v1/organizations/:organizationId/reportes/ventas-prestadores
 * Reporte de ventas agrupadas por prestador. Solo admins.
 */
export declare const getReporteVentasPrestadores: (req: Request, res: Response) => Promise<Response>;
/**
 * GET /api/v1/organizations/:organizationId/reportes/ventas-por-producto
 * Reporte de ventas por producto y fecha. Solo admins.
 */
export declare const getReporteVentasPorProducto: (req: Request, res: Response) => Promise<Response>;
//# sourceMappingURL=reporte.controller.d.ts.map