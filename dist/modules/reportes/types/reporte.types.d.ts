import type { UUID } from '@/shared/database/types.js';
/**
 * Tipo de respuesta para reporte de eventos por actividad
 */
export interface ReporteEventosPorActividadItem {
    actividadId: UUID;
    actividadName: string;
    totalEventos: number;
    totalPersonas: number;
    eventosPorStatus: {
        programado: number;
        en_curso: number;
        completado: number;
        cancelado: number;
    };
    fechaInicio: string | null;
    fechaFin: string | null;
}
/**
 * Tipo de respuesta para reporte de eventos por prestador
 */
export interface ReporteEventosPorPrestadorItem {
    prestadorId: UUID;
    prestadorName: string;
    totalEventos: number;
    totalPersonas: number;
    eventosPorStatus: {
        programado: number;
        en_curso: number;
        completado: number;
        cancelado: number;
    };
    actividadesRealizadas: Array<{
        actividadId: UUID;
        actividadName: string;
        totalEventos: number;
    }>;
    fechaInicio: string | null;
    fechaFin: string | null;
}
/**
 * Tipo de respuesta para reporte de eventos por fecha
 */
export interface ReporteEventosPorFechaItem {
    date: string;
    totalEventos: number;
    totalPersonas: number;
    eventosPorActividad: Array<{
        actividadId: UUID;
        actividadName: string;
        totalEventos: number;
        totalPersonas: number;
    }>;
    eventosPorStatus: {
        programado: number;
        en_curso: number;
        completado: number;
        cancelado: number;
    };
}
/**
 * Tipo de respuesta para reporte de capacidad utilizada
 */
export interface ReporteCapacidadUtilizadaItem {
    actividadId: UUID;
    actividadName: string;
    agendaType: 'BLOQUES' | 'HORARIO_LIBRE';
    date: string;
    capacidadTotal: number;
    capacidadUsada: number;
    capacidadDisponible: number;
    porcentajeUtilizado: number;
    bloqueId: UUID | null;
    bloqueName: string | null;
}
/**
 * Tipo de respuesta para reporte de prestadores activos
 */
export interface ReportePrestadoresActivosItem {
    prestadorId: UUID;
    prestadorName: string;
    status: 'activo' | 'inactivo' | 'suspendido';
    permitExpiresAt: Date | null;
    totalEventos: number;
    totalPersonas: number;
    actividadesPermitidas: number;
    ultimoEvento: string | null;
}
/**
 * Tipo de respuesta para reporte de stock actual por producto
 */
export interface ReporteStockActualItem {
    productoAccesoId: UUID;
    productName: string;
    tipo: 'brazalete' | 'pasaporte';
    vigenciaDias: number;
    cantidad: number;
}
/**
 * Tipo de respuesta para reporte de salidas de stock por período
 */
export interface ReporteSalidasStockItem {
    totalCantidad: number;
    totalMontoTotal: number;
    cantidadMovimientos: number;
    dateFrom: string | null;
    dateTo: string | null;
    porProducto?: Array<{
        productoAccesoId: UUID;
        productName: string;
        cantidad: number;
        montoTotal: number;
        cantidadMovimientos: number;
    }>;
}
/**
 * Tipo de respuesta para reporte de ventas por prestador
 */
export interface ReporteVentasPrestadoresItem {
    prestadorId: UUID | null;
    prestadorName: string | null;
    totalCantidad: number;
    totalMontoTotal: number;
    cantidadMovimientos: number;
}
/**
 * Tipo de respuesta para reporte de ventas por producto y fecha
 */
export interface ReporteVentasPorProductoItem {
    productoAccesoId: UUID;
    productName: string;
    fecha: string;
    totalCantidad: number;
    totalMontoTotal: number;
    cantidadMovimientos: number;
}
//# sourceMappingURL=reporte.types.d.ts.map