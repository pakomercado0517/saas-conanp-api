import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry } from '../../../shared/swagger/index.js';
extendZodWithOpenApi(z);
const TIPO_VALUES = ['brazalete', 'pasaporte'];
const tipoEnum = z.enum(TIPO_VALUES, {
    error: 'El tipo debe ser brazalete o pasaporte',
});
/**
 * Schema Zod para crear producto de acceso
 */
export const CreateProductoAccesoSchema = registry.register('CreateProductoAcceso', z
    .object({
    name: z
        .string()
        .min(1, { message: 'El nombre no puede estar vacío' })
        .max(255, { message: 'El nombre no puede exceder 255 caracteres' })
        .trim()
        .describe('Nombre del producto (ej. Brazalete 1 día, Pasaporte anual)'),
    tipo: tipoEnum.describe('Tipo: brazalete o pasaporte'),
    vigenciaDias: z
        .number()
        .int('La vigencia debe ser un número entero')
        .positive('La vigencia debe ser al menos 1 día')
        .describe('Días de vigencia (1, 365, etc.)'),
    precioReferencia: z
        .number()
        .nonnegative('El precio de referencia no puede ser negativo')
        .optional()
        .nullable()
        .describe('Precio de referencia informativo para reportes'),
    active: z.boolean().optional().default(true).describe('Si el producto está activo'),
})
    .openapi({
    example: {
        name: 'Brazalete 1 día',
        tipo: 'brazalete',
        vigenciaDias: 1,
        precioReferencia: 50.0,
        active: true,
    },
}));
/**
 * Schema Zod para actualizar producto de acceso
 */
export const UpdateProductoAccesoSchema = registry.register('UpdateProductoAcceso', z
    .object({
    name: z
        .string()
        .min(1, { message: 'El nombre no puede estar vacío' })
        .max(255, { message: 'El nombre no puede exceder 255 caracteres' })
        .trim()
        .optional()
        .describe('Nuevo nombre (opcional)'),
    tipo: tipoEnum.optional().describe('Nuevo tipo (opcional)'),
    vigenciaDias: z
        .number()
        .int('La vigencia debe ser un número entero')
        .positive('La vigencia debe ser al menos 1 día')
        .optional()
        .describe('Nuevos días de vigencia (opcional)'),
    precioReferencia: z
        .number()
        .nonnegative('El precio de referencia no puede ser negativo')
        .optional()
        .nullable()
        .describe('Nuevo precio de referencia (opcional)'),
    active: z.boolean().optional().describe('Actualizar estado activo (opcional)'),
})
    .refine((data) => Object.keys(data).some((k) => data[k] !== undefined), {
    message: 'Debe incluir al menos un campo para actualizar',
})
    .openapi({
    example: {
        name: 'Brazalete 1 día - Actualizado',
        precioReferencia: 55.0,
        active: true,
    },
}));
const SORT_FIELDS = ['name', 'tipo', 'vigenciaDias', 'active', 'createdAt', 'updatedAt'];
/**
 * Schema Zod para listar productos de acceso (query params)
 */
export const ListProductosAccesoSchema = registry.register('ListProductosAcceso', z.object({
    page: z.coerce
        .number()
        .int('La página debe ser un número entero')
        .positive('La página debe ser mayor a cero')
        .default(1)
        .describe('Número de página'),
    limit: z.coerce
        .number()
        .int('El límite debe ser un número entero')
        .positive('El límite debe ser mayor a cero')
        .max(100, 'El límite no puede exceder 100')
        .default(20)
        .describe('Elementos por página (máximo 100)'),
    sortBy: z
        .enum(SORT_FIELDS, {
        message: `Ordenar por debe ser uno de: ${SORT_FIELDS.join(', ')}`,
    })
        .optional()
        .describe('Campo por el cual ordenar'),
    sortOrder: z
        .enum(['asc', 'desc'], { message: 'El orden debe ser asc o desc' })
        .default('desc')
        .describe('Orden ascendente o descendente'),
    name: z
        .string()
        .trim()
        .optional()
        .transform((val) => (val === '' ? undefined : val))
        .describe('Filtrar por nombre (búsqueda parcial)'),
    tipo: tipoEnum.optional().describe('Filtrar por tipo (brazalete o pasaporte)'),
    active: z.coerce.boolean().optional().describe('Filtrar por estado activo'),
}));
//# sourceMappingURL=producto-acceso.validator.js.map