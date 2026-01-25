import { z } from 'zod';
import { DateTime } from 'luxon';
import { parseDate, parseDateOnly, parseTimeOnly } from './utils';
/**
 * Schema Zod para validar DateTime ISO
 */
export const dateTimeSchema = z
    .string({
    message: 'La fecha y hora deben ser un string',
})
    .refine((val) => {
    const dt = parseDate(val);
    return dt !== null && dt.isValid;
}, {
    message: 'La fecha y hora deben tener un formato ISO válido (ej: 2026-01-24T10:30:00-06:00)',
})
    .transform((val) => {
    const dt = parseDate(val);
    if (!dt || !dt.isValid) {
        throw new z.ZodError([
            {
                code: 'custom',
                message: 'Fecha inválida',
                path: [],
            },
        ]);
    }
    return dt;
});
/**
 * Schema Zod para validar fecha solo (YYYY-MM-DD)
 */
export const dateOnlySchema = z
    .string({
    message: 'La fecha debe ser un string',
})
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener el formato YYYY-MM-DD (ej: 2026-01-24)',
})
    .refine((val) => {
    const dt = parseDateOnly(val);
    return dt !== null && dt.isValid;
}, {
    message: 'La fecha no es válida',
})
    .transform((val) => {
    const dt = parseDateOnly(val);
    if (!dt || !dt.isValid) {
        throw new z.ZodError([
            {
                code: 'custom',
                message: 'Fecha inválida',
                path: [],
            },
        ]);
    }
    return dt;
});
/**
 * Schema Zod para validar hora solo (HH:mm:ss)
 */
export const timeOnlySchema = z
    .string({
    message: 'La hora debe ser un string',
})
    .regex(/^\d{2}:\d{2}:\d{2}$/, {
    message: 'La hora debe tener el formato HH:mm:ss (ej: 10:30:00)',
})
    .refine((val) => {
    const dt = parseTimeOnly(val);
    return dt !== null && dt.isValid;
}, {
    message: 'La hora no es válida',
})
    .transform((val) => {
    const dt = parseTimeOnly(val);
    if (!dt || !dt.isValid) {
        throw new z.ZodError([
            {
                code: 'custom',
                message: 'Hora inválida',
                path: [],
            },
        ]);
    }
    return dt;
});
/**
 * Schema Zod para validar rango de fechas
 */
export const dateRangeSchema = z
    .object({
    startDate: dateTimeSchema,
    endDate: dateTimeSchema,
})
    .refine((data) => {
    return data.startDate < data.endDate;
}, {
    message: 'La fecha de inicio debe ser anterior a la fecha de fin',
    path: ['endDate'],
});
/**
 * Schema Zod opcional para DateTime
 */
export const optionalDateTimeSchema = dateTimeSchema.optional().nullable();
/**
 * Schema Zod opcional para fecha solo
 */
export const optionalDateOnlySchema = dateOnlySchema.optional().nullable();
/**
 * Schema Zod opcional para hora solo
 */
export const optionalTimeOnlySchema = timeOnlySchema.optional().nullable();
/**
 * Schema Zod para validar que una fecha no esté en el pasado
 */
export const futureDateSchema = dateTimeSchema.refine((dt) => {
    return dt > DateTime.now().setZone('America/Mexico_City');
}, {
    message: 'La fecha no puede estar en el pasado',
});
/**
 * Schema Zod para validar que una fecha no esté en el futuro
 */
export const pastDateSchema = dateTimeSchema.refine((dt) => {
    return dt < DateTime.now().setZone('America/Mexico_City');
}, {
    message: 'La fecha no puede estar en el futuro',
});
//# sourceMappingURL=zod-schemas.js.map