import type { UUID } from '../../../shared/database/types.js';
import type { ReporteEventosPorActividadDTO, ReporteEventosPorPrestadorDTO, ReporteEventosPorFechaDTO, ReporteCapacidadUtilizadaDTO, ReportePrestadoresActivosDTO, ReporteStockActualDTO, ReporteSalidasStockDTO, ReporteVentasPrestadoresDTO, ReporteVentasPorProductoDTO } from '../../../modules/reportes/validators/reporte.validator.js';
import type { ReporteEventosPorActividadItem, ReporteEventosPorPrestadorItem, ReporteEventosPorFechaItem, ReporteCapacidadUtilizadaItem, ReportePrestadoresActivosItem, ReporteStockActualItem, ReporteSalidasStockItem, ReporteVentasPrestadoresItem, ReporteVentasPorProductoItem } from '../../../modules/reportes/types/reporte.types.js';
/**
 * Obtiene reporte de eventos agrupados por actividad
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros opcionales (actividadId, dateFrom, dateTo, status)
 * @param userId - ID del usuario que solicita
 * @returns Array con datos agrupados por actividad
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {ValidationError} Si el rango de fechas excede el máximo
 */
export declare const getReporteEventosPorActividad: (organizationId: UUID, filters: ReporteEventosPorActividadDTO, userId: UUID) => Promise<ReporteEventosPorActividadItem[]>;
/**
 * Obtiene reporte de eventos agrupados por prestador
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros opcionales (prestadorId, dateFrom, dateTo, status)
 * @param userId - ID del usuario que solicita
 * @returns Array con datos agrupados por prestador
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {ValidationError} Si el rango de fechas excede el máximo
 */
export declare const getReporteEventosPorPrestador: (organizationId: UUID, filters: ReporteEventosPorPrestadorDTO, userId: UUID) => Promise<ReporteEventosPorPrestadorItem[]>;
/**
 * Obtiene reporte de eventos agrupados por fecha
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros (dateFrom o dateTo requeridos, actividadId opcional, prestadorId opcional)
 * @param userId - ID del usuario que solicita
 * @returns Array con datos agrupados por fecha
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {ValidationError} Si no se proporciona dateFrom o dateTo o rango excede máximo
 */
export declare const getReporteEventosPorFecha: (organizationId: UUID, filters: ReporteEventosPorFechaDTO, userId: UUID) => Promise<ReporteEventosPorFechaItem[]>;
/**
 * Obtiene reporte de capacidad utilizada
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros opcionales (actividadId, dateFrom, dateTo)
 * @param userId - ID del usuario que solicita
 * @returns Array con datos de capacidad utilizada
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 * @throws {ValidationError} Si el rango de fechas excede el máximo
 */
export declare const getReporteCapacidadUtilizada: (organizationId: UUID, filters: ReporteCapacidadUtilizadaDTO, userId: UUID) => Promise<ReporteCapacidadUtilizadaItem[]>;
/**
 * Obtiene reporte de prestadores activos
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros opcionales (status, conPermisosVigentes)
 * @param userId - ID del usuario que solicita
 * @returns Array con datos de prestadores activos
 * @throws {ForbiddenError} Si no tiene acceso a la organización
 */
export declare const getReportePrestadoresActivos: (organizationId: UUID, filters: ReportePrestadoresActivosDTO, userId: UUID) => Promise<ReportePrestadoresActivosItem[]>;
/**
 * Reporte de stock actual por producto (por organización).
 */
export declare const getReporteStockActual: (organizationId: UUID, _filters: ReporteStockActualDTO, userId: UUID) => Promise<ReporteStockActualItem[]>;
/**
 * Reporte de salidas de stock por período (cantidad y montos totales).
 */
export declare const getReporteSalidasPorPeriodo: (organizationId: UUID, filters: ReporteSalidasStockDTO, userId: UUID) => Promise<ReporteSalidasStockItem>;
/**
 * Reporte de ventas (salidas con motivo venta) agrupadas por prestador.
 */
export declare const getReporteVentasPorPrestador: (organizationId: UUID, filters: ReporteVentasPrestadoresDTO, userId: UUID) => Promise<ReporteVentasPrestadoresItem[]>;
/**
 * Reporte de ventas por producto y fecha.
 */
export declare const getReporteVentasPorProducto: (organizationId: UUID, filters: ReporteVentasPorProductoDTO, userId: UUID) => Promise<ReporteVentasPorProductoItem[]>;
//# sourceMappingURL=reporte.service.d.ts.map