import { z } from 'zod';
/**
 * Schema Zod para crear producto de acceso
 */
export declare const CreateProductoAccesoSchema: z.ZodObject<{
    name: z.ZodString;
    tipo: z.ZodEnum<{
        brazalete: "brazalete";
        pasaporte: "pasaporte";
    }>;
    vigenciaDias: z.ZodNumber;
    precioReferencia: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    active: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export type CreateProductoAccesoDTO = z.infer<typeof CreateProductoAccesoSchema>;
/**
 * Schema Zod para actualizar producto de acceso
 */
export declare const UpdateProductoAccesoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    tipo: z.ZodOptional<z.ZodEnum<{
        brazalete: "brazalete";
        pasaporte: "pasaporte";
    }>>;
    vigenciaDias: z.ZodOptional<z.ZodNumber>;
    precioReferencia: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    active: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type UpdateProductoAccesoDTO = z.infer<typeof UpdateProductoAccesoSchema>;
/**
 * Schema Zod para listar productos de acceso (query params)
 */
export declare const ListProductosAccesoSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        name: "name";
        active: "active";
        createdAt: "createdAt";
        updatedAt: "updatedAt";
        tipo: "tipo";
        vigenciaDias: "vigenciaDias";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    name: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    tipo: z.ZodOptional<z.ZodEnum<{
        brazalete: "brazalete";
        pasaporte: "pasaporte";
    }>>;
    active: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
export type ListProductosAccesoDTO = z.infer<typeof ListProductosAccesoSchema>;
//# sourceMappingURL=producto-acceso.validator.d.ts.map