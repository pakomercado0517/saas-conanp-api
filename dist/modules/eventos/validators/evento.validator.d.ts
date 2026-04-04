import { z } from 'zod';
/**
 * Schema Zod para crear evento (con validación condicional según tipo de agenda)
 *
 * - Si agendaType = BLOQUES → requiere bloqueId
 * - Si agendaType = HORARIO_LIBRE → requiere startTime y endTime (endTime > startTime)
 * - Si paymentRequired = true → debe indicar al menos 1 persona (peopleCount >= 1)
 */
export declare const CreateEventoSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    actividadId: z.ZodString;
    prestadorId: z.ZodString;
    date: z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>;
    peopleCount: z.ZodDefault<z.ZodNumber>;
    paymentRequired: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    agendaType: z.ZodLiteral<"BLOQUES">;
    bloqueId: z.ZodString;
    capacityOverride: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    capacityOverrideReason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    actividadId: z.ZodString;
    prestadorId: z.ZodString;
    date: z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>;
    peopleCount: z.ZodDefault<z.ZodNumber>;
    paymentRequired: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    agendaType: z.ZodLiteral<"HORARIO_LIBRE">;
    startTime: z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>;
    endTime: z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>;
    capacityOverride: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    capacityOverrideReason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>], "agendaType">;
export type CreateEventoDTO = z.infer<typeof CreateEventoSchema>;
/**
 * Schema Zod para actualizar evento
 */
export declare const UpdateEventoSchema: z.ZodObject<{
    date: z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>;
    bloqueId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    startTime: z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>;
    endTime: z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>;
    peopleCount: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<{
        programado: "programado";
        en_curso: "en_curso";
        completado: "completado";
        cancelado: "cancelado";
    }>>;
    paymentRequired: z.ZodOptional<z.ZodBoolean>;
    capacityOverride: z.ZodOptional<z.ZodBoolean>;
    capacityOverrideReason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateEventoDTO = z.infer<typeof UpdateEventoSchema>;
/**
 * Schema Zod para listar eventos (query params: paginación y filtros)
 */
export declare const ListEventosSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        createdAt: "createdAt";
        updatedAt: "updatedAt";
        status: "status";
        date: "date";
        startTime: "startTime";
        endTime: "endTime";
        peopleCount: "peopleCount";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    actividadId: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    prestadorId: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    status: z.ZodOptional<z.ZodEnum<{
        programado: "programado";
        en_curso: "en_curso";
        completado: "completado";
        cancelado: "cancelado";
    }>>;
    date: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>, z.ZodTransform<import("luxon").DateTime<boolean> | undefined, import("luxon").DateTime<boolean> | null | undefined>>;
    dateFrom: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>, z.ZodTransform<import("luxon").DateTime<boolean> | undefined, import("luxon").DateTime<boolean> | null | undefined>>;
    dateTo: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>, z.ZodTransform<import("luxon").DateTime<boolean> | undefined, import("luxon").DateTime<boolean> | null | undefined>>;
    bloqueId: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
}, z.core.$strip>;
export type ListEventosDTO = z.infer<typeof ListEventosSchema>;
//# sourceMappingURL=evento.validator.d.ts.map