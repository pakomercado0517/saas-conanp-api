import { z } from 'zod';
/**
 * Schema Zod para crear capacidad
 */
export declare const CreateCapacidadSchema: z.ZodObject<{
    actividadId: z.ZodString;
    date: z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>;
    limit: z.ZodNumber;
}, z.core.$strip>;
export type CreateCapacidadDTO = z.infer<typeof CreateCapacidadSchema>;
/**
 * Schema Zod para actualizar capacidad
 */
export declare const UpdateCapacidadSchema: z.ZodObject<{
    date: z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type UpdateCapacidadDTO = z.infer<typeof UpdateCapacidadSchema>;
/**
 * Schema Zod para verificar disponibilidad
 */
export declare const VerificarDisponibilidadSchema: z.ZodObject<{
    actividadId: z.ZodString;
    date: z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>;
    bloqueId: z.ZodOptional<z.ZodString>;
    cantidad: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export type VerificarDisponibilidadDTO = z.infer<typeof VerificarDisponibilidadSchema>;
//# sourceMappingURL=capacidad.validator.d.ts.map