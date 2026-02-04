import { z } from 'zod';
/**
 * Schema Zod para crear intención de pago
 */
export declare const CreatePaymentIntentSchema: z.ZodObject<{
    eventoId: z.ZodString;
    amount: z.ZodPipe<z.ZodNumber, z.ZodTransform<number, number>>;
    currency: z.ZodEnum<{
        MXN: "MXN";
        USD: "USD";
    }>;
    metadata: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    paymentMethod: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type CreatePaymentIntentDTO = z.infer<typeof CreatePaymentIntentSchema>;
/**
 * Schema Zod para confirmar pago
 */
export declare const ConfirmPaymentSchema: z.ZodObject<{
    paymentId: z.ZodString;
    stripePaymentIntentId: z.ZodString;
    paymentMethod: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type ConfirmPaymentDTO = z.infer<typeof ConfirmPaymentSchema>;
/**
 * Schema Zod para listar pagos (query params: paginación y filtros)
 */
export declare const ListPaymentsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        createdAt: "createdAt";
        updatedAt: "updatedAt";
        status: "status";
        amount: "amount";
        currency: "currency";
        refundedAmount: "refundedAmount";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    eventoId: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    status: z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        processing: "processing";
        succeeded: "succeeded";
        failed: "failed";
        refunded: "refunded";
        cancelled: "cancelled";
    }>>;
    currency: z.ZodPipe<z.ZodTransform<{} | undefined, unknown>, z.ZodOptional<z.ZodString>>;
    dateFrom: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>, z.ZodTransform<import("luxon").DateTime<boolean> | undefined, import("luxon").DateTime<boolean> | null | undefined>>;
    dateTo: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>, z.ZodTransform<import("luxon").DateTime<boolean> | undefined, import("luxon").DateTime<boolean> | null | undefined>>;
    amountMin: z.ZodOptional<z.ZodPipe<z.ZodCoercedNumber<unknown>, z.ZodTransform<number, number>>>;
    amountMax: z.ZodOptional<z.ZodPipe<z.ZodCoercedNumber<unknown>, z.ZodTransform<number, number>>>;
}, z.core.$strip>;
export type ListPaymentsDTO = z.infer<typeof ListPaymentsSchema>;
/**
 * Schema Zod para procesar reembolso
 */
export declare const ProcessRefundSchema: z.ZodObject<{
    paymentId: z.ZodString;
    amount: z.ZodOptional<z.ZodPipe<z.ZodNumber, z.ZodTransform<number, number>>>;
    reason: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type ProcessRefundDTO = z.infer<typeof ProcessRefundSchema>;
//# sourceMappingURL=payment.validator.d.ts.map