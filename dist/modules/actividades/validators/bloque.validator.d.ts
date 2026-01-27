import { z } from 'zod';
/**
 * Schema Zod para crear bloque
 */
export declare const CreateBloqueSchema: z.ZodObject<{
    organizationId: z.ZodString;
    actividadId: z.ZodString;
    date: z.ZodNullable<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>;
    startTime: z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>;
    endTime: z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>;
    capacity: z.ZodDefault<z.ZodNumber>;
    isTemplate: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type CreateBloqueDTO = z.infer<typeof CreateBloqueSchema>;
/**
 * Schema Zod para crear bloque desde plantilla
 */
export declare const CreateBloqueFromTemplateSchema: z.ZodObject<{
    templateId: z.ZodString;
    date: z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>;
    capacity: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type CreateBloqueFromTemplateDTO = z.infer<typeof CreateBloqueFromTemplateSchema>;
/**
 * Schema Zod para actualizar bloque
 */
export declare const UpdateBloqueSchema: z.ZodObject<{
    date: z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>;
    startTime: z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>;
    endTime: z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>;
    capacity: z.ZodOptional<z.ZodNumber>;
    isTemplate: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type UpdateBloqueDTO = z.infer<typeof UpdateBloqueSchema>;
/**
 * Schema Zod para listar bloques (query params: paginación y filtros)
 */
export declare const ListBloquesSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        createdAt: "createdAt";
        updatedAt: "updatedAt";
        date: "date";
        capacity: "capacity";
        startTime: "startTime";
        endTime: "endTime";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    actividadId: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    date: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>, z.ZodTransform<import("luxon").DateTime<boolean> | undefined, import("luxon").DateTime<boolean> | null | undefined>>;
    isTemplate: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    organizationId: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
}, z.core.$strip>;
export type ListBloquesDTO = z.infer<typeof ListBloquesSchema>;
//# sourceMappingURL=bloque.validator.d.ts.map