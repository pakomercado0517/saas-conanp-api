import { z } from 'zod';
/**
 * Schema Zod para crear permiso
 */
export declare const CreatePermisoSchema: z.ZodObject<{
    prestadorId: z.ZodString;
    actividadId: z.ZodString;
    validFrom: z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>;
    validTo: z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        activo: "activo";
        inactivo: "inactivo";
        suspendido: "suspendido";
        vencido: "vencido";
    }>>>;
    documentUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    appliesToAllAreas: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export type CreatePermisoDTO = z.infer<typeof CreatePermisoSchema>;
/**
 * Schema Zod para actualizar permiso
 */
export declare const UpdatePermisoSchema: z.ZodObject<{
    validFrom: z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>;
    validTo: z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>;
    status: z.ZodOptional<z.ZodEnum<{
        activo: "activo";
        inactivo: "inactivo";
        suspendido: "suspendido";
        vencido: "vencido";
    }>>;
    documentUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type UpdatePermisoDTO = z.infer<typeof UpdatePermisoSchema>;
/**
 * Schema Zod para listar permisos (query params: paginación y filtros)
 */
export declare const ListPermisosSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        createdAt: "createdAt";
        updatedAt: "updatedAt";
        status: "status";
        validFrom: "validFrom";
        validTo: "validTo";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    prestadorId: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    actividadId: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    status: z.ZodOptional<z.ZodEnum<{
        activo: "activo";
        inactivo: "inactivo";
        suspendido: "suspendido";
        vencido: "vencido";
    }>>;
    validFrom: z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>;
    validTo: z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>;
    documentUrl: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
}, z.core.$strip>;
export type ListPermisosDTO = z.infer<typeof ListPermisosSchema>;
//# sourceMappingURL=permiso.validator.d.ts.map