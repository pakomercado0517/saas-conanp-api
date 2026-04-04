// This file does not contain code fence markers to remove.
// The following code is the actual content of the file.
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry } from '../../../shared/swagger/index.js';
import { dateTimeSchema, optionalDateTimeSchema } from '../../../shared/dates/zod-schemas.js';
import { URL } from 'url';
extendZodWithOpenApi(z);
// Constantes para enums reutilizables
const STATUS_VALUES = ['activo', 'inactivo', 'vencido', 'suspendido'];
// Enum Zod para status
const statusEnum = z.enum(STATUS_VALUES, {
    error: 'El estado debe ser: activo, inactivo, vencido o suspendido',
});
/**
 * Schema Zod para validar URL con protocolos http/https
 */
const urlSchema = z
    .string({
    message: 'La URL del documento debe ser un texto',
})
    .url({
    message: 'La URL del documento debe ser una URL válida',
})
    .refine((url) => {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    }
    catch {
        return false;
    }
}, {
    message: 'La URL del documento debe usar el protocolo http o https',
});
/**
 * Schema Zod para crear permiso
 */
export const CreatePermisoSchema = registry.register('CreatePermiso', z
    .object({
    prestadorId: z
        .string({
        message: 'El ID de prestador es requerido y debe ser un texto',
    })
        .uuid({
        message: 'El ID de prestador debe ser un UUID válido',
    }),
    actividadId: z
        .string({
        message: 'El ID de actividad es requerido y debe ser un texto',
    })
        .uuid({
        message: 'El ID de actividad debe ser un UUID válido',
    }),
    validFrom: dateTimeSchema,
    validTo: dateTimeSchema,
    status: statusEnum.optional().default('activo'),
    documentUrl: urlSchema.optional().nullable(),
    appliesToAllAreas: z
        .boolean()
        .optional()
        .default(false)
        .describe('Si es true, crea un permiso por cada área de la dependencia con actividad de mismo nombre normalizado'),
})
    .openapi({
    example: {
        prestadorId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        actividadId: 'b1c2d3e4-f5a6-7890-abcd-1234567890ab',
        validFrom: '2026-03-01T00:00:00Z',
        validTo: '2026-12-31T23:59:59Z',
        status: 'activo',
        documentUrl: 'https://example.com/document.pdf',
        appliesToAllAreas: false,
    },
})
    .refine((data) => data.validTo > data.validFrom, {
    message: 'La fecha de fin (validTo) debe ser posterior a la fecha de inicio (validFrom)',
    path: ['validTo'],
}));
/**
 * Schema Zod para actualizar permiso
 */
export const UpdatePermisoSchema = registry.register('UpdatePermiso', z
    .object({
    validFrom: optionalDateTimeSchema,
    validTo: optionalDateTimeSchema,
    status: statusEnum.optional(),
    documentUrl: urlSchema.optional().nullable(),
})
    .refine((data) => {
    if (data.validFrom && data.validTo) {
        return data.validTo > data.validFrom;
    }
    return true;
}, {
    message: 'La fecha de fin (validTo) debe ser posterior a la fecha de inicio (validFrom)',
    path: ['validTo'],
})
    .openapi({
    example: {
        status: 'suspendido',
    },
})
    .refine((data) => Object.keys(data).some((k) => data[k] !== undefined), {
    message: 'Debe incluir al menos un campo para actualizar',
}));
// Campos permitidos para ordenamiento
const SORT_FIELDS = ['validFrom', 'validTo', 'status', 'createdAt', 'updatedAt'];
/**
 * Schema Zod para listar permisos (query params: paginación y filtros)
 */
export const ListPermisosSchema = z.object({
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
    prestadorId: z
        .string()
        .uuid({
        message: 'El ID de prestador debe ser un UUID válido',
    })
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
    actividadId: z
        .string()
        .uuid({
        message: 'El ID de actividad debe ser un UUID válido',
    })
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
    status: statusEnum.optional(),
    validFrom: optionalDateTimeSchema,
    validTo: optionalDateTimeSchema,
    documentUrl: z
        .string()
        .trim()
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
});
/**
 * Query params para listar prestadores con sus permisos anidados por área.
 * Reutiliza filtros de permisos; la paginación aplica sobre prestadores distintos.
 */
export const ListPrestadoresConPermisosPorAreaSchema = ListPermisosSchema.extend({
    soloVigentes: z.coerce
        .boolean()
        .optional()
        .default(false)
        .describe('Si es true, solo incluye permisos vigentes a la fecha actual (status activo y fechas válidas)'),
});
//# sourceMappingURL=permiso.validator.js.map