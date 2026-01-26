import { z } from 'zod';
/**
 * Schema Zod para crear activo
 */
export declare const CreateActivoSchema: z.ZodObject<{
    organizationId: z.ZodString;
    ownerId: z.ZodString;
    type: z.ZodEnum<{
        embarcacion: "embarcacion";
        vehiculo: "vehiculo";
        guia: "guia";
        equipo: "equipo";
    }>;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        pendiente: "pendiente";
        aprobado: "aprobado";
        rechazado: "rechazado";
        suspendido: "suspendido";
    }>>>;
}, z.core.$strip>;
export type CreateActivoDTO = z.infer<typeof CreateActivoSchema>;
/**
 * Schema Zod para actualizar activo
 */
export declare const UpdateActivoSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<{
        embarcacion: "embarcacion";
        vehiculo: "vehiculo";
        guia: "guia";
        equipo: "equipo";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        pendiente: "pendiente";
        aprobado: "aprobado";
        rechazado: "rechazado";
        suspendido: "suspendido";
    }>>;
}, z.core.$strip>;
export type UpdateActivoDTO = z.infer<typeof UpdateActivoSchema>;
/**
 * Schema Zod para listar activos (query params: paginación y filtros)
 */
export declare const ListActivosSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        createdAt: "createdAt";
        updatedAt: "updatedAt";
        type: "type";
        status: "status";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    ownerId: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    type: z.ZodOptional<z.ZodEnum<{
        embarcacion: "embarcacion";
        vehiculo: "vehiculo";
        guia: "guia";
        equipo: "equipo";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        pendiente: "pendiente";
        aprobado: "aprobado";
        rechazado: "rechazado";
        suspendido: "suspendido";
    }>>;
}, z.core.$strip>;
export type ListActivosDTO = z.infer<typeof ListActivosSchema>;
/**
 * Schema Zod para crear requisito de activo
 */
export declare const CreateActivoRequisitoSchema: z.ZodObject<{
    activoId: z.ZodString;
    key: z.ZodString;
    value: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    documentUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    validated: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export type CreateActivoRequisitoDTO = z.infer<typeof CreateActivoRequisitoSchema>;
/**
 * Schema Zod para actualizar requisito de activo
 * No se actualiza `key` (forma parte del único activoId+key).
 */
export declare const UpdateActivoRequisitoSchema: z.ZodObject<{
    value: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    documentUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    validated: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type UpdateActivoRequisitoDTO = z.infer<typeof UpdateActivoRequisitoSchema>;
/**
 * Schema Zod para listar requisitos de un activo (query params)
 * activoId se recibe por ruta.
 */
export declare const ListActivoRequisitosSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        createdAt: "createdAt";
        updatedAt: "updatedAt";
        key: "key";
        validated: "validated";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    validated: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
export type ListActivoRequisitosDTO = z.infer<typeof ListActivoRequisitosSchema>;
//# sourceMappingURL=activo.validator.d.ts.map