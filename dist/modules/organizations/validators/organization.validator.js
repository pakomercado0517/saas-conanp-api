import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry } from '../../../shared/swagger/index.js';
extendZodWithOpenApi(z);
const ECOSYSTEM_VALUES = ['terrestre', 'maritimo', 'mixto'];
const ecosystemTypeEnum = z.enum(ECOSYSTEM_VALUES, {
    error: 'El tipo de ecosistema debe ser: terrestre, maritimo o mixto',
});
const settingsSchema = z.record(z.string(), z.unknown()).refine((val) => !Array.isArray(val), {
    message: 'Settings debe ser un objeto',
});
/**
 * Schema Zod para crear organización
 */
export const CreateOrganizationSchema = registry.register('CreateOrganization', z
    .object({
    name: z
        .string({
        message: 'El nombre es requerido y debe ser un texto',
    })
        .min(1, {
        message: 'El nombre no puede estar vacío',
    })
        .max(255, {
        message: 'El nombre no puede exceder 255 caracteres',
    })
        .trim()
        .describe('Nombre de la organización (ANP)'),
    ecosystem_type: ecosystemTypeEnum.describe('Tipo de ecosistema de la ANP: terrestre, marítimo o mixto'),
    settings: settingsSchema
        .optional()
        .default({})
        .describe('Configuraciones personalizadas de la organización (JSONB)'),
})
    .openapi({
    example: {
        name: 'Reserva de la Biosfera Los Tuxtlas',
        ecosystem_type: 'mixto',
        settings: {
            capacidadMaxima: 500,
            horaApertura: '08:00',
            horaCierre: '18:00',
        },
    },
}));
/**
 * Schema Zod para actualizar organización
 */
export const UpdateOrganizationSchema = registry.register('UpdateOrganization', z
    .object({
    name: z
        .string({
        message: 'El nombre debe ser un texto',
    })
        .min(1, {
        message: 'El nombre no puede estar vacío',
    })
        .max(255, {
        message: 'El nombre no puede exceder 255 caracteres',
    })
        .trim()
        .optional()
        .describe('Nuevo nombre de la organización (opcional)'),
    ecosystem_type: ecosystemTypeEnum
        .optional()
        .describe('Nuevo tipo de ecosistema (opcional)'),
    settings: settingsSchema.optional().describe('Nuevas configuraciones (opcional)'),
})
    .refine((data) => Object.keys(data).some((k) => data[k] !== undefined), {
    message: 'Debe incluir al menos un campo para actualizar',
})
    .openapi({
    example: {
        name: 'Reserva de la Biosfera Los Tuxtlas - Actualizado',
        settings: {
            capacidadMaxima: 600,
        },
    },
}));
const SORT_FIELDS = ['name', 'createdAt', 'ecosystem_type', 'updatedAt'];
/**
 * Schema Zod para enlistar organizaciones (query params: paginación y filtros)
 */
export const ListOrganizationsSchema = registry.register('ListOrganizations', z.object({
    page: z.coerce
        .number()
        .int('La página debe ser un número entero')
        .positive('La página debe ser mayor a cero')
        .default(1)
        .describe('Número de página para la paginación'),
    limit: z.coerce
        .number()
        .int('El límite debe ser un número entero')
        .positive('El límite debe ser mayor a cero')
        .max(100, 'El límite no puede exceder 100')
        .default(20)
        .describe('Cantidad de elementos por página (máximo 100)'),
    sortBy: z
        .enum(SORT_FIELDS, {
        message: `Ordenar por debe ser uno de: ${SORT_FIELDS.join(', ')}`,
    })
        .optional()
        .describe('Campo por el cual ordenar los resultados'),
    sortOrder: z
        .enum(['asc', 'desc'], {
        message: 'El orden debe ser asc o desc',
    })
        .default('desc')
        .describe('Orden ascendente (asc) o descendente (desc)'),
    name: z
        .string()
        .trim()
        .optional()
        .transform((val) => (val === '' ? undefined : val))
        .describe('Filtrar por nombre (búsqueda parcial)'),
    ecosystem_type: ecosystemTypeEnum
        .optional()
        .describe('Filtrar por tipo de ecosistema: terrestre, marítimo o mixto'),
}));
//# sourceMappingURL=organization.validator.js.map