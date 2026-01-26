import { z } from 'zod';
import { dateOnlySchema, optionalDateOnlySchema } from '../../../shared/dates/zod-schemas';
/**
 * Schema Zod para crear capacidad
 */
export const CreateCapacidadSchema = z.object({
    actividadId: z
        .string({
        message: 'El ID de actividad es requerido y debe ser un texto',
    })
        .uuid({
        message: 'El ID de actividad debe ser un UUID válido',
    }),
    date: dateOnlySchema,
    limit: z
        .number({
        message: 'El límite debe ser un número',
    })
        .int({
        message: 'El límite debe ser un número entero',
    })
        .positive({
        message: 'El límite debe ser mayor a cero',
    })
        .min(1, {
        message: 'El límite debe ser al menos 1',
    }),
});
/**
 * Schema Zod para actualizar capacidad
 */
export const UpdateCapacidadSchema = z
    .object({
    date: optionalDateOnlySchema,
    limit: z
        .number({
        message: 'El límite debe ser un número',
    })
        .int({
        message: 'El límite debe ser un número entero',
    })
        .positive({
        message: 'El límite debe ser mayor a cero',
    })
        .min(1, {
        message: 'El límite debe ser al menos 1',
    })
        .optional(),
})
    .refine((data) => Object.keys(data).some((k) => data[k] !== undefined), {
    message: 'Debe incluir al menos un campo para actualizar',
});
/**
 * Schema Zod para verificar disponibilidad
 */
export const VerificarDisponibilidadSchema = z.object({
    actividadId: z
        .string({
        message: 'El ID de actividad es requerido y debe ser un texto',
    })
        .uuid({
        message: 'El ID de actividad debe ser un UUID válido',
    }),
    date: dateOnlySchema,
    bloqueId: z
        .string({
        message: 'El ID de bloque debe ser un texto',
    })
        .uuid({
        message: 'El ID de bloque debe ser un UUID válido',
    })
        .optional(),
    cantidad: z
        .number({
        message: 'La cantidad debe ser un número',
    })
        .int({
        message: 'La cantidad debe ser un número entero',
    })
        .positive({
        message: 'La cantidad debe ser mayor a cero',
    })
        .min(1, {
        message: 'La cantidad debe ser al menos 1',
    })
        .optional()
        .default(1),
});
//# sourceMappingURL=capacidad.validator.js.map