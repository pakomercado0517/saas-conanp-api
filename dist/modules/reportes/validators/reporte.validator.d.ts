import { z } from 'zod';
/**
 * Schema Zod para reporte de eventos por actividad
 */
export declare const ReporteEventosPorActividadSchema: z.ZodObject<{
    actividadId: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    dateFrom: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>, z.ZodTransform<import("luxon").DateTime<boolean> | undefined, import("luxon").DateTime<boolean> | null | undefined>>;
    dateTo: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>, z.ZodTransform<import("luxon").DateTime<boolean> | undefined, import("luxon").DateTime<boolean> | null | undefined>>;
    status: z.ZodOptional<z.ZodEnum<{
        programado: "programado";
        en_curso: "en_curso";
        completado: "completado";
        cancelado: "cancelado";
    }>>;
}, z.core.$strip>;
export type ReporteEventosPorActividadDTO = z.infer<typeof ReporteEventosPorActividadSchema>;
/**
 * Schema Zod para reporte de eventos por prestador
 */
export declare const ReporteEventosPorPrestadorSchema: z.ZodObject<{
    prestadorId: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    dateFrom: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>, z.ZodTransform<import("luxon").DateTime<boolean> | undefined, import("luxon").DateTime<boolean> | null | undefined>>;
    dateTo: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>, z.ZodTransform<import("luxon").DateTime<boolean> | undefined, import("luxon").DateTime<boolean> | null | undefined>>;
    status: z.ZodOptional<z.ZodEnum<{
        programado: "programado";
        en_curso: "en_curso";
        completado: "completado";
        cancelado: "cancelado";
    }>>;
}, z.core.$strip>;
export type ReporteEventosPorPrestadorDTO = z.infer<typeof ReporteEventosPorPrestadorSchema>;
/**
 * Schema Zod para reporte de eventos por fecha
 */
export declare const ReporteEventosPorFechaSchema: z.ZodObject<{
    dateFrom: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>, z.ZodTransform<import("luxon").DateTime<boolean> | undefined, import("luxon").DateTime<boolean> | null | undefined>>;
    dateTo: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>, z.ZodTransform<import("luxon").DateTime<boolean> | undefined, import("luxon").DateTime<boolean> | null | undefined>>;
    actividadId: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    prestadorId: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
}, z.core.$strip>;
export type ReporteEventosPorFechaDTO = z.infer<typeof ReporteEventosPorFechaSchema>;
/**
 * Schema Zod para reporte de capacidad utilizada
 */
export declare const ReporteCapacidadUtilizadaSchema: z.ZodObject<{
    actividadId: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    dateFrom: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>, z.ZodTransform<import("luxon").DateTime<boolean> | undefined, import("luxon").DateTime<boolean> | null | undefined>>;
    dateTo: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>, z.ZodTransform<import("luxon").DateTime<boolean> | undefined, import("luxon").DateTime<boolean> | null | undefined>>;
}, z.core.$strip>;
export type ReporteCapacidadUtilizadaDTO = z.infer<typeof ReporteCapacidadUtilizadaSchema>;
/**
 * Schema Zod para reporte de prestadores activos
 */
export declare const ReportePrestadoresActivosSchema: z.ZodObject<{
    status: z.ZodDefault<z.ZodEnum<{
        activo: "activo";
        inactivo: "inactivo";
        suspendido: "suspendido";
    }>>;
    conPermisosVigentes: z.ZodDefault<z.ZodOptional<z.ZodCoercedBoolean<unknown>>>;
}, z.core.$strip>;
export type ReportePrestadoresActivosDTO = z.infer<typeof ReportePrestadoresActivosSchema>;
//# sourceMappingURL=reporte.validator.d.ts.map