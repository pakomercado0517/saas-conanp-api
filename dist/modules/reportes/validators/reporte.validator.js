import { z } from 'zod';
import { optionalDateOnlySchema } from '@/shared/dates/zod-schemas.js';
import { registry } from '@/shared/swagger/index.js';
// Constantes para enums reutilizables
const EVENTO_STATUS_VALUES = ['programado', 'en_curso', 'completado', 'cancelado'];
const PRESTADOR_STATUS_VALUES = ['activo', 'inactivo', 'suspendido'];
// Enum Zod para status de evento
const eventoStatusEnum = z.enum(EVENTO_STATUS_VALUES, {
    error: 'El estado debe ser: programado, en_curso, completado o cancelado',
});
// Enum Zod para status de prestador
const prestadorStatusEnum = z.enum(PRESTADOR_STATUS_VALUES, {
    error: 'El estado debe ser: activo, inactivo o suspendido',
});
/**
 * Schema Zod para reporte de eventos por actividad
 */
export const ReporteEventosPorActividadSchema = z
    .object({
    actividadId: z
        .string()
        .uuid({
        message: 'El ID de actividad debe ser un UUID válido',
    })
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
    dateFrom: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    dateTo: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    status: eventoStatusEnum.optional(),
})
    .refine((data) => {
    // Si ambos están presentes, dateFrom debe ser anterior a dateTo
    if (data.dateFrom && data.dateTo) {
        return data.dateFrom <= data.dateTo;
    }
    return true;
}, {
    message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin',
    path: ['dateTo'],
});
/**
 * Schema Zod para reporte de eventos por prestador
 */
export const ReporteEventosPorPrestadorSchema = z
    .object({
    prestadorId: z
        .string()
        .uuid({
        message: 'El ID de prestador debe ser un UUID válido',
    })
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
    dateFrom: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    dateTo: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    status: eventoStatusEnum.optional(),
})
    .refine((data) => {
    if (data.dateFrom && data.dateTo) {
        return data.dateFrom <= data.dateTo;
    }
    return true;
}, {
    message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin',
    path: ['dateTo'],
});
/**
 * Schema Zod para reporte de eventos por fecha
 */
export const ReporteEventosPorFechaSchema = z
    .object({
    dateFrom: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    dateTo: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    actividadId: z
        .string()
        .uuid({
        message: 'El ID de actividad debe ser un UUID válido',
    })
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
    prestadorId: z
        .string()
        .uuid({
        message: 'El ID de prestador debe ser un UUID válido',
    })
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
})
    .refine((data) => {
    // Al menos uno de dateFrom o dateTo debe estar presente
    if (!data.dateFrom && !data.dateTo) {
        return false;
    }
    // Si ambos están presentes, dateFrom debe ser anterior o igual a dateTo
    if (data.dateFrom && data.dateTo) {
        return data.dateFrom <= data.dateTo;
    }
    return true;
}, {
    message: 'Debe proporcionar al menos una fecha (dateFrom o dateTo), y si ambas están presentes, dateFrom debe ser anterior o igual a dateTo',
    path: ['dateFrom'],
});
/**
 * Schema Zod para reporte de capacidad utilizada
 */
export const ReporteCapacidadUtilizadaSchema = z
    .object({
    actividadId: z
        .string()
        .uuid({
        message: 'El ID de actividad debe ser un UUID válido',
    })
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
    dateFrom: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    dateTo: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
})
    .refine((data) => {
    if (data.dateFrom && data.dateTo) {
        return data.dateFrom <= data.dateTo;
    }
    return true;
}, {
    message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin',
    path: ['dateTo'],
});
/**
 * Schema Zod para reporte de prestadores activos
 */
export const ReportePrestadoresActivosSchema = z.object({
    status: prestadorStatusEnum.default('activo'),
    conPermisosVigentes: z.coerce
        .boolean({
        message: 'conPermisosVigentes debe ser un booleano',
    })
        .optional()
        .default(false),
});
/**
 * Schema para reporte de stock actual por producto (sin filtros de query)
 */
export const ReporteStockActualSchema = z.object({});
/**
 * Schema para reporte de salidas de stock por período
 */
export const ReporteSalidasStockSchema = z
    .object({
    dateFrom: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    dateTo: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    productoAccesoId: z
        .string()
        .uuid({ message: 'El ID de producto debe ser un UUID válido' })
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
})
    .refine((data) => {
    if (data.dateFrom && data.dateTo) {
        return data.dateFrom <= data.dateTo;
    }
    return true;
}, { message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin', path: ['dateTo'] });
/**
 * Schema para reporte de ventas por prestador
 */
export const ReporteVentasPrestadoresSchema = z
    .object({
    dateFrom: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    dateTo: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
})
    .refine((data) => {
    if (data.dateFrom && data.dateTo) {
        return data.dateFrom <= data.dateTo;
    }
    return true;
}, { message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin', path: ['dateTo'] });
/**
 * Schema para reporte de ventas por producto y fecha
 */
export const ReporteVentasPorProductoSchema = z
    .object({
    dateFrom: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    dateTo: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    productoAccesoId: z
        .string()
        .uuid({ message: 'El ID de producto debe ser un UUID válido' })
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
})
    .refine((data) => {
    if (data.dateFrom && data.dateTo) {
        return data.dateFrom <= data.dateTo;
    }
    return true;
}, { message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin', path: ['dateTo'] });
// Registrar schemas en el registry de Swagger
registry.register('ReporteEventosPorActividad', ReporteEventosPorActividadSchema);
registry.register('ReporteEventosPorPrestador', ReporteEventosPorPrestadorSchema);
registry.register('ReporteEventosPorFecha', ReporteEventosPorFechaSchema);
registry.register('ReporteCapacidadUtilizada', ReporteCapacidadUtilizadaSchema);
registry.register('ReportePrestadoresActivos', ReportePrestadoresActivosSchema);
registry.register('ReporteStockActual', ReporteStockActualSchema);
registry.register('ReporteSalidasStock', ReporteSalidasStockSchema);
registry.register('ReporteVentasPrestadores', ReporteVentasPrestadoresSchema);
registry.register('ReporteVentasPorProducto', ReporteVentasPorProductoSchema);
//# sourceMappingURL=reporte.validator.js.map