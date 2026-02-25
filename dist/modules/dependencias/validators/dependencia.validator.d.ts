import { z } from 'zod';
export declare const CreateDependenciaSchema: z.ZodObject<{
    name: z.ZodString;
    settings: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
export type CreateDependenciaDTO = z.infer<typeof CreateDependenciaSchema>;
export declare const UpdateDependenciaSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export type UpdateDependenciaDTO = z.infer<typeof UpdateDependenciaSchema>;
export declare const ListDependenciasSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        name: "name";
        createdAt: "createdAt";
        updatedAt: "updatedAt";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    name: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
}, z.core.$strip>;
export type ListDependenciasDTO = z.infer<typeof ListDependenciasSchema>;
export declare const CreateAreaUnderDependenciaSchema: z.ZodObject<{
    name: z.ZodString;
    ecosystem_type: z.ZodEnum<{
        terrestre: "terrestre";
        maritimo: "maritimo";
        mixto: "mixto";
    }>;
    settings: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
export type CreateAreaUnderDependenciaDTO = z.infer<typeof CreateAreaUnderDependenciaSchema>;
/** Schema para super admin: crear dependencia y solo enviar invitación al primer admin (sin área). */
export declare const CreateDependenciaAdminSchema: z.ZodObject<{
    name: z.ZodString;
    admin_email: z.ZodString;
    settings: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
export type CreateDependenciaAdminDTO = z.infer<typeof CreateDependenciaAdminSchema>;
//# sourceMappingURL=dependencia.validator.d.ts.map