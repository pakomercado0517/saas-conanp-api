import { z } from 'zod';
/**
 * Schema para settings.acceso (configuración de brazaletes por ANP).
 * - brazaletesObligatorios: true | false | null (ausente = no configurado)
 * - brazaletesExcluyenLocales: solo aplica cuando brazaletesObligatorios === true
 */
export declare const SettingsAccesoSchema: z.ZodObject<{
    brazaletesObligatorios: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    brazaletesExcluyenLocales: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type SettingsAccesoDTO = z.infer<typeof SettingsAccesoSchema>;
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
    admin_email: z.ZodString;
    settings: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        acceso: z.ZodOptional<z.ZodObject<{
            brazaletesObligatorios: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            brazaletesExcluyenLocales: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
    }, z.core.$catchall<z.ZodUnknown>>>>;
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
    settings: z.ZodOptional<z.ZodObject<{
        acceso: z.ZodOptional<z.ZodObject<{
            brazaletesObligatorios: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            brazaletesExcluyenLocales: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
    }, z.core.$catchall<z.ZodUnknown>>>;
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