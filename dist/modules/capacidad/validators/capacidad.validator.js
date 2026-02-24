import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry } from '@/shared/swagger/index.js';
import { dateOnlySchema, optionalDateOnlySchema } from '@/shared/dates/zod-schemas.js';
// Extender Zod con funcionalidad OpenAPI
extendZodWithOpenApi(z);
/**
 * Schema Zod para crear capacidad
 */
export const CreateCapacidadSchema = registry.register('CreateCapacidad', z
    .object({
    actividadId: z
        .string({
        message: 'El ID de actividad es requerido y debe ser un texto',
    })
        .uuid({
        message: 'El ID de actividad debe ser un UUID válido',
    })
        .describe('ID de la actividad'),
    date: dateOnlySchema.describe('Fecha (YYYY-MM-DD)'),
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
        .describe('Límite máximo de personas para la fecha'),
})
    .openapi({
    example: {
        actividadId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        date: '2026-03-15',
        limit: 20,
    },
}));
/**
 * Schema Zod para actualizar capacidad
 */
export const UpdateCapacidadSchema = registry.register('UpdateCapacidad', z
    .object({
    date: optionalDateOnlySchema.optional().describe('Fecha (opcional, YYYY-MM-DD)'),
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
        .optional()
        .describe('Nuevo límite (opcional)'),
})
    .refine((data) => Object.keys(data).some((k) => data[k] !== undefined), {
    message: 'Debe incluir al menos un campo para actualizar',
})
    .openapi({
    example: {
        limit: 25,
    },
}));
/**
 * Schema Zod para verificar disponibilidad
 */
export const VerificarDisponibilidadSchema = registry.register('VerificarDisponibilidad', z
    .object({
    actividadId: z
        .string({
        message: 'El ID de actividad es requerido y debe ser un texto',
    })
        .uuid({
        message: 'El ID de actividad debe ser un UUID válido',
    })
        .describe('ID de la actividad'),
    date: dateOnlySchema.describe('Fecha (YYYY-MM-DD)'),
    bloqueId: z
        .string({
        message: 'El ID de bloque debe ser un texto',
    })
        .uuid({
        message: 'El ID de bloque debe ser un UUID válido',
    })
        .optional()
        .describe('ID del bloque (opcional, requerido si la actividad usa BLOQUES)'),
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
        .default(1)
        .describe('Cantidad solicitada para verificar disponibilidad'),
})
    .openapi({
    example: {
        actividadId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        date: '2026-03-15',
        bloqueId: 'd4e5f6a7-b8c9-0123-def4-567890abcdef',
        cantidad: 4,
    },
}));
//# sourceMappingURL=capacidad.validator.js.map