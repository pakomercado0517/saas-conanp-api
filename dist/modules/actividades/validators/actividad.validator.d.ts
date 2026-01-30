import { z } from 'zod';
/**
 * Schema Zod para crear actividad
 */
export declare const CreateActividadSchema: z.ZodObject<{
    organizationId: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<{
        terrestre: "terrestre";
        maritima: "maritima";
        mixta: "mixta";
    }>;
    agendaType: z.ZodEnum<{
        BLOQUES: "BLOQUES";
        HORARIO_LIBRE: "HORARIO_LIBRE";
    }>;
    requiresGuide: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    impactLevel: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    active: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export type CreateActividadDTO = z.infer<typeof CreateActividadSchema>;
/**
 * Schema Zod para actualizar actividad
 */
export declare const UpdateActividadSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        terrestre: "terrestre";
        maritima: "maritima";
        mixta: "mixta";
    }>>;
    agendaType: z.ZodOptional<z.ZodEnum<{
        BLOQUES: "BLOQUES";
        HORARIO_LIBRE: "HORARIO_LIBRE";
    }>>;
    requiresGuide: z.ZodOptional<z.ZodBoolean>;
    impactLevel: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    active: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type UpdateActividadDTO = z.infer<typeof UpdateActividadSchema>;
/**
 * Schema Zod para listar actividades (query params: paginación y filtros)
 */
export declare const ListActividadesSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        name: "name";
        active: "active";
        createdAt: "createdAt";
        updatedAt: "updatedAt";
        type: "type";
        agendaType: "agendaType";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    name: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    type: z.ZodOptional<z.ZodEnum<{
        terrestre: "terrestre";
        maritima: "maritima";
        mixta: "mixta";
    }>>;
    agendaType: z.ZodOptional<z.ZodEnum<{
        BLOQUES: "BLOQUES";
        HORARIO_LIBRE: "HORARIO_LIBRE";
    }>>;
    active: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    requiresGuide: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
export type ListActividadesDTO = z.infer<typeof ListActividadesSchema>;
//# sourceMappingURL=actividad.validator.d.ts.map