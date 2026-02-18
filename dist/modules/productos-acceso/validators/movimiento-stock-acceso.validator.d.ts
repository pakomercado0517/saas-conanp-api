import { z } from 'zod';
/**
 * Schema para registrar entrada de stock
 */
export declare const EntradaStockSchema: z.ZodObject<{
    cantidad: z.ZodNumber;
    fecha: z.ZodString;
    motivo: z.ZodEnum<{
        compra: "compra";
        ajuste: "ajuste";
        devolucion: "devolucion";
    }>;
    referencia: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notas: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type EntradaStockDTO = z.infer<typeof EntradaStockSchema>;
/**
 * Schema para registrar salida de stock (venta)
 */
export declare const SalidaStockSchema: z.ZodObject<{
    cantidad: z.ZodNumber;
    fecha: z.ZodString;
    motivo: z.ZodDefault<z.ZodOptional<z.ZodLiteral<"venta">>>;
    montoUnitario: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    montoTotal: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    prestadorId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    eventoId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    referencia: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notas: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type SalidaStockDTO = z.infer<typeof SalidaStockSchema>;
/**
 * Schema para listar movimientos (query params)
 */
export declare const ListMovimientosStockSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        createdAt: "createdAt";
        cantidad: "cantidad";
        tipo: "tipo";
        fecha: "fecha";
        motivo: "motivo";
    }>>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    productoAccesoId: z.ZodOptional<z.ZodString>;
    tipo: z.ZodOptional<z.ZodEnum<{
        entrada: "entrada";
        salida: "salida";
    }>>;
    fechaDesde: z.ZodOptional<z.ZodString>;
    fechaHasta: z.ZodOptional<z.ZodString>;
    prestadorId: z.ZodOptional<z.ZodString>;
    eventoId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ListMovimientosStockDTO = z.infer<typeof ListMovimientosStockSchema>;
//# sourceMappingURL=movimiento-stock-acceso.validator.d.ts.map