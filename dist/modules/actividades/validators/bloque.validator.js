import { z } from 'zod';
import { dateOnlySchema, optionalDateOnlySchema, timeOnlySchema, optionalTimeOnlySchema, } from '../../../shared/dates/zod-schemas';
/**
 * Schema Zod para crear bloque
 */
export const CreateBloqueSchema = z
    .object({
    organizationId: z
        .string({
        message: 'El ID de organización es requerido y debe ser un texto',
    })
        .uuid({
        message: 'El ID de organización debe ser un UUID válido',
    }),
    actividadId: z
        .string({
        message: 'El ID de actividad es requerido y debe ser un texto',
    })
        .uuid({
        message: 'El ID de actividad debe ser un UUID válido',
    }),
    date: dateOnlySchema.nullable(),
    startTime: timeOnlySchema,
    endTime: timeOnlySchema,
    capacity: z
        .number({
        message: 'La capacidad debe ser un número',
    })
        .int({
        message: 'La capacidad debe ser un número entero',
    })
        .positive({
        message: 'La capacidad debe ser mayor a cero',
    })
        .min(1, {
        message: 'La capacidad debe ser al menos 1',
    })
        .default(1),
    isTemplate: z
        .boolean({
        message: 'isTemplate debe ser un valor booleano',
    })
        .default(false),
})
    .refine((data) => {
    // Si es plantilla, date debe ser null
    if (data.isTemplate && data.date !== null) {
        return false;
    }
    // Si no es plantilla, date debe estar presente
    if (!data.isTemplate && data.date === null) {
        return false;
    }
    return true;
}, {
    message: 'Si es plantilla (isTemplate=true), la fecha debe ser null. Si no es plantilla (isTemplate=false), la fecha es requerida',
    path: ['date'],
})
    .refine((data) => {
    // Comparar horas: endTime debe ser posterior a startTime
    // Ambos son objetos DateTime con la misma fecha base, así que podemos compararlos directamente
    return data.endTime > data.startTime;
}, {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['endTime'],
});
/**
 * Schema Zod para crear bloque desde plantilla
 */
export const CreateBloqueFromTemplateSchema = z.object({
    templateId: z
        .string({
        message: 'El ID de plantilla es requerido y debe ser un texto',
    })
        .uuid({
        message: 'El ID de plantilla debe ser un UUID válido',
    }),
    date: dateOnlySchema,
    capacity: z
        .number({
        message: 'La capacidad debe ser un número',
    })
        .int({
        message: 'La capacidad debe ser un número entero',
    })
        .positive({
        message: 'La capacidad debe ser mayor a cero',
    })
        .min(1, {
        message: 'La capacidad debe ser al menos 1',
    })
        .optional(),
});
/**
 * Schema Zod para actualizar bloque
 */
export const UpdateBloqueSchema = z
    .object({
    date: optionalDateOnlySchema,
    startTime: optionalTimeOnlySchema,
    endTime: optionalTimeOnlySchema,
    capacity: z
        .number({
        message: 'La capacidad debe ser un número',
    })
        .int({
        message: 'La capacidad debe ser un número entero',
    })
        .positive({
        message: 'La capacidad debe ser mayor a cero',
    })
        .min(1, {
        message: 'La capacidad debe ser al menos 1',
    })
        .optional(),
    isTemplate: z
        .boolean({
        message: 'isTemplate debe ser un valor booleano',
    })
        .optional(),
})
    .refine((data) => {
    // Si se proporcionan ambos horarios, validar que endTime > startTime
    if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
    }
    return true;
}, {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['endTime'],
})
    .refine((data) => {
    // Validar relación entre isTemplate y date
    if (data.isTemplate !== undefined && data.date !== undefined) {
        // Si es plantilla, date debe ser null
        if (data.isTemplate && data.date !== null) {
            return false;
        }
        // Si no es plantilla, date no debe ser null
        if (!data.isTemplate && data.date === null) {
            return false;
        }
    }
    return true;
}, {
    message: 'Si es plantilla (isTemplate=true), la fecha debe ser null. Si no es plantilla (isTemplate=false), la fecha no puede ser null',
    path: ['date'],
})
    .refine((data) => Object.keys(data).some((k) => data[k] !== undefined), {
    message: 'Debe incluir al menos un campo para actualizar',
});
// Campos permitidos para ordenamiento
const SORT_FIELDS = ['date', 'startTime', 'endTime', 'capacity', 'createdAt', 'updatedAt'];
/**
 * Schema Zod para listar bloques (query params: paginación y filtros)
 */
export const ListBloquesSchema = z.object({
    page: z.coerce
        .number('La página debe ser un número')
        .int('La página debe ser un número entero')
        .positive('La página debe ser mayor a cero')
        .default(1),
    limit: z.coerce
        .number('El límite debe ser un número')
        .int('El límite debe ser un número entero')
        .positive('El límite debe ser mayor a cero')
        .max(100, 'El límite no puede exceder 100')
        .default(20),
    sortBy: z
        .enum(SORT_FIELDS, {
        error: `Ordenar por debe ser uno de: ${SORT_FIELDS.join(', ')}`,
    })
        .optional(),
    sortOrder: z
        .enum(['asc', 'desc'], {
        error: 'El orden debe ser asc o desc',
    })
        .default('desc'),
    actividadId: z
        .string()
        .uuid({
        message: 'El ID de actividad debe ser un UUID válido',
    })
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
    date: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    isTemplate: z.coerce
        .boolean({
        message: 'isTemplate debe ser un valor booleano',
    })
        .optional(),
    organizationId: z
        .string()
        .uuid({
        message: 'El ID de organización debe ser un UUID válido',
    })
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
});
//# sourceMappingURL=bloque.validator.js.map