import { z } from 'zod';
/**
 * Schema Zod para crear evidencia ambiental
 */
export declare const CreateEvidenciaSchema: z.ZodObject<{
    eventoId: z.ZodString;
    type: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    fileUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type CreateEvidenciaDTO = z.infer<typeof CreateEvidenciaSchema>;
/**
 * Schema Zod para actualizar evidencia ambiental
 */
export declare const UpdateEvidenciaSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    fileUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type UpdateEvidenciaDTO = z.infer<typeof UpdateEvidenciaSchema>;
/**
 * Schema Zod para listar evidencias ambientales (query params: paginación y filtros)
 */
export declare const ListEvidenciasSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        createdAt: "createdAt";
        updatedAt: "updatedAt";
        type: "type";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    eventoId: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    type: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
}, z.core.$strip>;
export type ListEvidenciasDTO = z.infer<typeof ListEvidenciasSchema>;
//# sourceMappingURL=evidencia.validator.d.ts.map