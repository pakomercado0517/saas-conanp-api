import { z } from 'zod';
/**
 * Schema Zod para crear perfil de prestador
 */
export declare const CreatePrestadorProfileSchema: z.ZodObject<{
    userId: z.ZodString;
    organizationId: z.ZodString;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        activo: "activo";
        inactivo: "inactivo";
        suspendido: "suspendido";
    }>>>;
    permitExpiresAt: z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>;
}, z.core.$strip>;
export type CreatePrestadorProfileDTO = z.infer<typeof CreatePrestadorProfileSchema>;
/**
 * Schema Zod para actualizar perfil de prestador
 */
export declare const UpdatePrestadorProfileSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        activo: "activo";
        inactivo: "inactivo";
        suspendido: "suspendido";
    }>>;
    permitExpiresAt: z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>;
}, z.core.$strip>;
export type UpdatePrestadorProfileDTO = z.infer<typeof UpdatePrestadorProfileSchema>;
/**
 * Schema Zod para listar prestadores (query params: paginación y filtros)
 */
export declare const ListPrestadoresSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        createdAt: "createdAt";
        updatedAt: "updatedAt";
        status: "status";
        permitExpiresAt: "permitExpiresAt";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        activo: "activo";
        inactivo: "inactivo";
        suspendido: "suspendido";
    }>>;
    userId: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    permitExpiresAt: z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>;
}, z.core.$strip>;
export type ListPrestadoresDTO = z.infer<typeof ListPrestadoresSchema>;
//# sourceMappingURL=prestador-profile.validator.d.ts.map