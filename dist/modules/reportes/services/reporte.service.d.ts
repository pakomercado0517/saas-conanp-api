import type { UUID } from '../../../shared/database/types.js';
import type { ReporteEventosPorActividadDTO, ReporteEventosPorPrestadorDTO, ReporteEventosPorFechaDTO, ReporteCapacidadUtilizadaDTO, ReportePrestadoresActivosDTO } from '../../../modules/reportes/validators/reporte.validator.js';
import type { ReporteEventosPorActividadItem, ReporteEventosPorPrestadorItem, ReporteEventosPorFechaItem, ReporteCapacidadUtilizadaItem, ReportePrestadoresActivosItem } from '../../../modules/reportes/types/reporte.types.js';
/**
 * Obtiene reporte de eventos agrupados por actividad
 *
 * @param organizationId - ID de la organización (multi-tenant)
 * @param filters - Filtros opcionales (actividadId, dateFrom, dateTo, status)
 * @param userId - ID del usuario que solicita
 * @returns Array con datos agrupados por actividad
 * @throws {ForbiddenError} Si no tiene acceso a la organización
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
 * @throws {ValidationError} Si no se proporciona dateFrom o dateTo
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
//# sourceMappingURL=reporte.service.d.ts.map