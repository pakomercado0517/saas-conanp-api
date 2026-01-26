import { z } from 'zod';
import { dateOnlySchema, optionalDateOnlySchema, timeOnlySchema, optionalTimeOnlySchema, } from '../../../shared/dates/zod-schemas.js';
// Constantes para enums reutilizables
const EVENTO_STATUS_VALUES = ['programado', 'en_curso', 'completado', 'cancelado'];
// Enum Zod para status de evento
const eventoStatusEnum = z.enum(EVENTO_STATUS_VALUES, {
    error: 'El estado debe ser: programado, en_curso, completado o cancelado',
});
/**
 * Schema base común para crear evento
 */
const CreateEventoBaseSchema = z.object({
    actividadId: z
        .string({
        message: 'El ID de actividad es requerido y debe ser un texto',
    })
        .uuid({
        message: 'El ID de actividad debe ser un UUID válido',
    }),
    prestadorId: z
        .string({
        message: 'El ID de prestador es requerido y debe ser un texto',
    })
        .uuid({
        message: 'El ID de prestador debe ser un UUID válido',
    }),
    date: dateOnlySchema,
    peopleCount: z
        .number({
        message: 'El número de personas debe ser un número',
    })
        .int({
        message: 'El número de personas debe ser un número entero',
    })
        .positive({
        message: 'El número de personas debe ser mayor a cero',
    })
        .min(1, {
        message: 'El número de personas debe ser al menos 1',
    })
        .default(1),
});
/**
 * Schema Zod para crear evento con tipo de agenda BLOQUES
 */
const CreateEventoBloquesSchema = CreateEventoBaseSchema.extend({
    agendaType: z.literal('BLOQUES'),
    bloqueId: z
        .string({
        message: 'El ID de bloque es requerido y debe ser un texto',
    })
        .uuid({
        message: 'El ID de bloque debe ser un UUID válido',
    }),
});
/**
 * Schema Zod para crear evento con tipo de agenda HORARIO_LIBRE
 */
const CreateEventoHorarioLibreSchema = CreateEventoBaseSchema.extend({
    agendaType: z.literal('HORARIO_LIBRE'),
    startTime: timeOnlySchema,
    endTime: timeOnlySchema,
}).refine((data) => {
    // Comparar horas: endTime debe ser posterior a startTime
    // Ambos son objetos DateTime con la misma fecha base, así que podemos compararlos directamente
    return data.endTime > data.startTime;
}, {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['endTime'],
});
/**
 * Schema Zod para crear evento (con validación condicional según tipo de agenda)
 *
 * - Si agendaType = BLOQUES → requiere bloqueId
 * - Si agendaType = HORARIO_LIBRE → requiere startTime y endTime (endTime > startTime)
 */
export const CreateEventoSchema = z.discriminatedUnion('agendaType', [
    CreateEventoBloquesSchema,
    CreateEventoHorarioLibreSchema,
]);
/**
 * Schema Zod para actualizar evento
 */
export const UpdateEventoSchema = z
    .object({
    date: optionalDateOnlySchema,
    bloqueId: z
        .string({
        message: 'El ID de bloque debe ser un texto',
    })
        .uuid({
        message: 'El ID de bloque debe ser un UUID válido',
    })
        .optional()
        .nullable(),
    startTime: optionalTimeOnlySchema,
    endTime: optionalTimeOnlySchema,
    peopleCount: z
        .number({
        message: 'El número de personas debe ser un número',
    })
        .int({
        message: 'El número de personas debe ser un número entero',
    })
        .positive({
        message: 'El número de personas debe ser mayor a cero',
    })
        .min(1, {
        message: 'El número de personas debe ser al menos 1',
    })
        .optional(),
    status: eventoStatusEnum.optional(),
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
    .refine((data) => Object.keys(data).some((k) => data[k] !== undefined), {
    message: 'Debe incluir al menos un campo para actualizar',
});
// Campos permitidos para ordenamiento
const SORT_FIELDS = [
    'date',
    'startTime',
    'endTime',
    'status',
    'peopleCount',
    'createdAt',
    'updatedAt',
];
/**
 * Schema Zod para listar eventos (query params: paginación y filtros)
 */
export const ListEventosSchema = z.object({
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
    prestadorId: z
        .string()
        .uuid({
        message: 'El ID de prestador debe ser un UUID válido',
    })
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
    status: eventoStatusEnum.optional(),
    date: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    dateFrom: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    dateTo: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    bloqueId: z
        .string()
        .uuid({
        message: 'El ID de bloque debe ser un UUID válido',
    })
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
});
//# sourceMappingURL=evento.validator.js.map