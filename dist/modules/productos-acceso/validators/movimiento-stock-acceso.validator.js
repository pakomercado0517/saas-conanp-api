import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry } from '@/shared/swagger/index.js';
extendZodWithOpenApi(z);
const MOTIVO_ENTRADA = ['compra', 'ajuste', 'devolucion'];
const motivoEntradaEnum = z.enum(MOTIVO_ENTRADA, {
    error: 'El motivo de entrada debe ser: compra, ajuste o devolucion',
});
/**
 * Schema para registrar entrada de stock
 */
export const EntradaStockSchema = registry.register('EntradaStock', z
    .object({
    cantidad: z
        .number()
        .int('La cantidad debe ser un número entero')
        .positive('La cantidad debe ser positiva')
        .describe('Cantidad a ingresar'),
    fecha: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe ser YYYY-MM-DD')
        .describe('Fecha del movimiento'),
    motivo: motivoEntradaEnum.describe('Motivo: compra, ajuste o devolucion'),
    referencia: z
        .string()
        .max(255)
        .trim()
        .optional()
        .nullable()
        .describe('Folio o número externo'),
    notas: z.string().max(5000).trim().optional().nullable().describe('Notas'),
})
    .openapi({
    example: {
        cantidad: 100,
        fecha: '2026-02-17',
        motivo: 'compra',
        referencia: 'FACT-001',
        notas: 'Compra mensual',
    },
}));
/**
 * Schema para registrar salida de stock (venta)
 */
export const SalidaStockSchema = registry.register('SalidaStock', z
    .object({
    cantidad: z
        .number()
        .int('La cantidad debe ser un número entero')
        .positive('La cantidad debe ser positiva')
        .describe('Cantidad a sacar'),
    fecha: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe ser YYYY-MM-DD')
        .describe('Fecha del movimiento'),
    motivo: z
        .literal('venta')
        .describe('En salidas el motivo es venta')
        .optional()
        .default('venta'),
    montoUnitario: z
        .number()
        .nonnegative('El monto unitario no puede ser negativo')
        .optional()
        .nullable()
        .describe('Precio unitario (informativo)'),
    montoTotal: z
        .number()
        .nonnegative('El monto total no puede ser negativo')
        .optional()
        .nullable()
        .describe('Monto total (informativo)'),
    prestadorId: z
        .string()
        .uuid()
        .optional()
        .nullable()
        .describe('Prestador asociado (trazabilidad)'),
    eventoId: z.string().uuid().optional().nullable().describe('Evento asociado (trazabilidad)'),
    referencia: z
        .string()
        .max(255)
        .trim()
        .optional()
        .nullable()
        .describe('Folio o número externo'),
    notas: z.string().max(5000).trim().optional().nullable().describe('Notas'),
})
    .openapi({
    example: {
        cantidad: 5,
        fecha: '2026-02-17',
        montoUnitario: 50,
        montoTotal: 250,
        referencia: 'VENTA-001',
    },
}));
const SORT_FIELDS = ['fecha', 'cantidad', 'tipo', 'motivo', 'createdAt'];
/**
 * Schema para listar movimientos (query params)
 */
export const ListMovimientosStockSchema = registry.register('ListMovimientosStock', z.object({
    page: z.coerce.number().int().positive().default(1).describe('Página'),
    limit: z.coerce.number().int().positive().max(100).default(20).describe('Elementos por página'),
    sortBy: z
        .enum(SORT_FIELDS, {
        message: `Ordenar por debe ser uno de: ${SORT_FIELDS.join(', ')}`,
    })
        .optional()
        .default('createdAt')
        .describe('Campo para ordenar'),
    sortOrder: z.enum(['asc', 'desc']).default('desc').describe('Orden'),
    productoAccesoId: z.string().uuid().optional().describe('Filtrar por producto'),
    tipo: z.enum(['entrada', 'salida']).optional().describe('Filtrar por tipo'),
    fechaDesde: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD')
        .optional()
        .describe('Fecha desde'),
    fechaHasta: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD')
        .optional()
        .describe('Fecha hasta'),
    prestadorId: z.string().uuid().optional().describe('Filtrar por prestador'),
    eventoId: z.string().uuid().optional().describe('Filtrar por evento'),
}));
//# sourceMappingURL=movimiento-stock-acceso.validator.js.map