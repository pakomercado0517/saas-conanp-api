import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry } from '@/shared/swagger/index.js';
import { dateOnlySchema, optionalDateOnlySchema, timeOnlySchema, optionalTimeOnlySchema, } from '@/shared/dates/zod-schemas.js';
// Extender Zod con funcionalidad OpenAPI
extendZodWithOpenApi(z);
// Constantes para enums reutilizables
const EVENTO_STATUS_VALUES = ['programado', 'en_curso', 'completado', 'cancelado'];
// Enum Zod para status de evento
const eventoStatusEnum = registry.register('EventoStatus', z
    .enum(EVENTO_STATUS_VALUES, {
    error: 'El estado debe ser: programado, en_curso, completado o cancelado',
})
    .openapi({
    description: 'Estado del evento operativo: programado, en_curso, completado o cancelado',
    example: 'programado',
}));
/** Refine: si paymentRequired es true, debe indicar al menos 1 persona. */
const createEventoPaymentRefine = (data) => !data.paymentRequired || (data.peopleCount != null && data.peopleCount >= 1);
/**
 * Schema Zod para crear evento (con validación condicional según tipo de agenda)
 *
 * - Si agendaType = BLOQUES → requiere bloqueId
 * - Si agendaType = HORARIO_LIBRE → requiere startTime y endTime (endTime > startTime)
 * - Si paymentRequired = true → debe indicar al menos 1 persona (peopleCount >= 1)
 */
export const CreateEventoSchema = registry.register('CreateEvento', z
    .discriminatedUnion('agendaType', [
    z.object({
        actividadId: z
            .string({
            message: 'El ID de actividad es requerido y debe ser un texto',
        })
            .uuid({
            message: 'El ID de actividad debe ser un UUID válido',
        })
            .describe('ID de la actividad turística'),
        prestadorId: z
            .string({
            message: 'El ID de prestador es requerido y debe ser un texto',
        })
            .uuid({
            message: 'El ID de prestador debe ser un UUID válido',
        })
            .describe('ID del prestador de servicios turísticos'),
        date: dateOnlySchema.describe('Fecha del evento en formato YYYY-MM-DD'),
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
            .default(1)
            .describe('Número de personas que participarán en el evento'),
        paymentRequired: z
            .boolean({
            message: 'paymentRequired debe ser true o false',
        })
            .optional()
            .default(false)
            .describe('Indica si el evento requiere pago'),
        agendaType: z
            .literal('BLOQUES')
            .describe('Tipo de agenda: BLOQUES para horarios predefinidos'),
        bloqueId: z
            .string({
            message: 'El ID de bloque es requerido y debe ser un texto',
        })
            .uuid({
            message: 'El ID de bloque debe ser un UUID válido',
        })
            .describe('ID del bloque horario predefinido'),
    }),
    z
        .object({
        actividadId: z
            .string({
            message: 'El ID de actividad es requerido y debe ser un texto',
        })
            .uuid({
            message: 'El ID de actividad debe ser un UUID válido',
        })
            .describe('ID de la actividad turística'),
        prestadorId: z
            .string({
            message: 'El ID de prestador es requerido y debe ser un texto',
        })
            .uuid({
            message: 'El ID de prestador debe ser un UUID válido',
        })
            .describe('ID del prestador de servicios turísticos'),
        date: dateOnlySchema.describe('Fecha del evento en formato YYYY-MM-DD'),
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
            .default(1)
            .describe('Número de personas que participarán en el evento'),
        paymentRequired: z
            .boolean({
            message: 'paymentRequired debe ser true o false',
        })
            .optional()
            .default(false)
            .describe('Indica si el evento requiere pago'),
        agendaType: z
            .literal('HORARIO_LIBRE')
            .describe('Tipo de agenda: HORARIO_LIBRE para horarios definidos por el prestador'),
        startTime: timeOnlySchema.describe('Hora de inicio del evento en formato HH:mm:ss'),
        endTime: timeOnlySchema.describe('Hora de fin del evento en formato HH:mm:ss (debe ser posterior a startTime)'),
    })
        .refine((data) => {
        // Comparar horas: endTime debe ser posterior a startTime
        // Ambos son objetos DateTime con la misma fecha base, así que podemos compararlos directamente
        return data.endTime > data.startTime;
    }, {
        message: 'La hora de fin debe ser posterior a la hora de inicio',
        path: ['endTime'],
    }),
])
    .refine(createEventoPaymentRefine, {
    message: 'Si el evento requiere pago (paymentRequired: true), debe indicar al menos 1 persona (peopleCount >= 1).',
    path: ['paymentRequired'],
}));
/**
 * Schema Zod para actualizar evento
 */
export const UpdateEventoSchema = registry.register('UpdateEvento', z
    .object({
    date: optionalDateOnlySchema.describe('Fecha del evento en formato YYYY-MM-DD (opcional)'),
    bloqueId: z
        .string({
        message: 'El ID de bloque debe ser un texto',
    })
        .uuid({
        message: 'El ID de bloque debe ser un UUID válido',
    })
        .optional()
        .nullable()
        .describe('ID del bloque horario (opcional, puede ser null para cambiar a HORARIO_LIBRE)'),
    startTime: optionalTimeOnlySchema.describe('Hora de inicio del evento en formato HH:mm:ss (opcional)'),
    endTime: optionalTimeOnlySchema.describe('Hora de fin del evento en formato HH:mm:ss (opcional)'),
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
        .optional()
        .describe('Número de personas que participarán en el evento (opcional)'),
    status: eventoStatusEnum.optional().describe('Estado del evento (opcional)'),
    paymentRequired: z
        .boolean({
        message: 'paymentRequired debe ser true o false',
    })
        .optional()
        .describe('Indica si el evento requiere pago (opcional)'),
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
})
    .refine((data) => {
    if (data.paymentRequired === true && data.peopleCount !== undefined) {
        return data.peopleCount >= 1;
    }
    return true;
}, {
    message: 'Si paymentRequired es true, peopleCount debe ser al menos 1.',
    path: ['peopleCount'],
}));
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
export const ListEventosSchema = registry.register('ListEventos', z.object({
    page: z.coerce
        .number('La página debe ser un número')
        .int('La página debe ser un número entero')
        .positive('La página debe ser mayor a cero')
        .default(1)
        .describe('Número de página para la paginación'),
    limit: z.coerce
        .number('El límite debe ser un número')
        .int('El límite debe ser un número entero')
        .positive('El límite debe ser mayor a cero')
        .max(100, 'El límite no puede exceder 100')
        .default(20)
        .describe('Cantidad de elementos por página (máximo 100)'),
    sortBy: z
        .enum(SORT_FIELDS, {
        error: `Ordenar por debe ser uno de: ${SORT_FIELDS.join(', ')}`,
    })
        .optional()
        .describe('Campo por el cual ordenar los resultados'),
    sortOrder: z
        .enum(['asc', 'desc'], {
        error: 'El orden debe ser asc o desc',
    })
        .default('desc')
        .describe('Orden ascendente (asc) o descendente (desc)'),
    actividadId: z
        .string()
        .uuid({
        message: 'El ID de actividad debe ser un UUID válido',
    })
        .optional()
        .transform((val) => (val === '' ? undefined : val))
        .describe('Filtrar por ID de actividad'),
    prestadorId: z
        .string()
        .uuid({
        message: 'El ID de prestador debe ser un UUID válido',
    })
        .optional()
        .transform((val) => (val === '' ? undefined : val))
        .describe('Filtrar por ID de prestador'),
    status: eventoStatusEnum.optional().describe('Filtrar por estado del evento'),
    date: optionalDateOnlySchema
        .transform((val) => (val === null ? undefined : val))
        .describe('Filtrar por fecha exacta (YYYY-MM-DD)'),
    dateFrom: optionalDateOnlySchema
        .transform((val) => (val === null ? undefined : val))
        .describe('Filtrar por fecha mínima (YYYY-MM-DD)'),
    dateTo: optionalDateOnlySchema
        .transform((val) => (val === null ? undefined : val))
        .describe('Filtrar por fecha máxima (YYYY-MM-DD)'),
    bloqueId: z
        .string()
        .uuid({
        message: 'El ID de bloque debe ser un UUID válido',
    })
        .optional()
        .transform((val) => (val === '' ? undefined : val))
        .describe('Filtrar por ID de bloque'),
}));
//# sourceMappingURL=evento.validator.js.map