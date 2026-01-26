import { z } from 'zod';
/**
 * Schema Zod para crear organización
 */
export declare const CreateOrganizationSchema: z.ZodObject<{
    name: z.ZodString;
    ecosystem_type: z.ZodEnum<{
        terrestre: "terrestre";
        maritimo: "maritimo";
        mixto: "mixto";
    }>;
    settings: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
export type CreateOrganizationDTO = z.infer<typeof CreateOrganizationSchema>;
/**
 * Schema Zod para actualizar organización
 */
export declare const UpdateOrganizationSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    ecosystem_type: z.ZodOptional<z.ZodEnum<{
        terrestre: "terrestre";
        maritimo: "maritimo";
        mixto: "mixto";
    }>>;
    settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export type UpdateOrganizationDTO = z.infer<typeof UpdateOrganizationSchema>;
/**
 * Schema Zod para enlistar organizaciones (query params: paginación y filtros)
 */
export declare const ListOrganizationsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        name: "name";
        createdAt: "createdAt";
        updatedAt: "updatedAt";
        ecosystem_type: "ecosystem_type";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    name: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    ecosystem_type: z.ZodOptional<z.ZodEnum<{
        terrestre: "terrestre";
        maritimo: "maritimo";
        mixto: "mixto";
    }>>;
}, z.core.$strip>;
export type ListOrganizationsDTO = z.infer<typeof ListOrganizationsSchema>;
//# sourceMappingURL=organization.validator.d.ts.map