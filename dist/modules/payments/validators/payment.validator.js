import { z } from 'zod';
import { optionalDateOnlySchema } from '../../../shared/dates/zod-schemas.js';
// Constantes para monedas permitidas
const ALLOWED_CURRENCIES = ['MXN', 'USD'];
// Schema helper para montos (decimales → centavos)
// Acepta números decimales positivos y los transforma a centavos (enteros)
const amountSchema = z
    .number({
    message: 'El monto debe ser un número',
})
    .positive({
    message: 'El monto debe ser positivo',
})
    .min(0.01, {
    message: 'El monto mínimo es 0.01',
})
    .transform((val) => Math.round(val * 100));
// Schema helper para montos opcionales (para filtros y reembolsos)
const optionalAmountSchema = z
    .number({
    message: 'El monto debe ser un número',
})
    .positive({
    message: 'El monto debe ser positivo',
})
    .min(0.01, {
    message: 'El monto mínimo es 0.01',
})
    .transform((val) => Math.round(val * 100))
    .optional();
// Schema helper para monedas
const currencySchema = z.enum(ALLOWED_CURRENCIES, {
    error: `La moneda debe ser una de: ${ALLOWED_CURRENCIES.join(', ')}`,
});
// Schema helper para monedas opcionales (para filtros)
const optionalCurrencySchema = z.preprocess((val) => {
    if (val === undefined || val === null)
        return undefined;
    if (typeof val === 'string') {
        const trimmed = val.trim();
        return trimmed === '' ? undefined : trimmed.toUpperCase();
    }
    return val;
}, z
    .string()
    .refine((val) => ALLOWED_CURRENCIES.includes(val), {
    message: `La moneda debe ser una de: ${ALLOWED_CURRENCIES.join(', ')}`,
})
    .optional());
// Enum para estados de pago
const PAYMENT_STATUSES_TUPLE = [
    'pending',
    'processing',
    'succeeded',
    'failed',
    'refunded',
    'cancelled',
];
const paymentStatusEnum = z.enum(PAYMENT_STATUSES_TUPLE, {
    error: `El estado debe ser uno de: ${PAYMENT_STATUSES_TUPLE.join(', ')}`,
});
/**
 * Schema Zod para crear intención de pago
 */
export const CreatePaymentIntentSchema = z.object({
    eventoId: z
        .string({
        message: 'El ID de evento es requerido y debe ser un texto',
    })
        .uuid({
        message: 'El ID de evento debe ser un UUID válido',
    }),
    amount: amountSchema,
    currency: currencySchema,
    metadata: z
        .record(z.string(), z.unknown(), {
        message: 'Los metadatos deben ser un objeto',
    })
        .optional()
        .nullable(),
    paymentMethod: z
        .string({
        message: 'El método de pago debe ser un texto',
    })
        .trim()
        .max(50, {
        message: 'El método de pago no puede exceder 50 caracteres',
    })
        .optional()
        .nullable(),
});
/**
 * Schema Zod para confirmar pago
 */
export const ConfirmPaymentSchema = z.object({
    paymentId: z
        .string({
        message: 'El ID de pago es requerido y debe ser un texto',
    })
        .uuid({
        message: 'El ID de pago debe ser un UUID válido',
    }),
    stripePaymentIntentId: z
        .string({
        message: 'El ID de PaymentIntent de Stripe es requerido',
    })
        .trim()
        .refine((val) => val.startsWith('pi_'), {
        message: 'El ID de PaymentIntent de Stripe debe comenzar con "pi_"',
    }),
    paymentMethod: z
        .string({
        message: 'El método de pago debe ser un texto',
    })
        .trim()
        .max(50, {
        message: 'El método de pago no puede exceder 50 caracteres',
    })
        .optional()
        .nullable(),
});
// Campos permitidos para ordenamiento
const SORT_FIELDS = [
    'amount',
    'currency',
    'status',
    'createdAt',
    'updatedAt',
    'refundedAmount',
];
/**
 * Schema Zod para listar pagos (query params: paginación y filtros)
 */
export const ListPaymentsSchema = z
    .object({
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
    eventoId: z
        .string()
        .uuid({
        message: 'El ID de evento debe ser un UUID válido',
    })
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
    status: paymentStatusEnum.optional(),
    currency: optionalCurrencySchema,
    dateFrom: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    dateTo: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    amountMin: z.coerce
        .number('El monto mínimo debe ser un número')
        .positive('El monto mínimo debe ser positivo')
        .min(0.01, 'El monto mínimo debe ser al menos 0.01')
        .transform((val) => Math.round(val * 100))
        .optional(),
    amountMax: z.coerce
        .number('El monto máximo debe ser un número')
        .positive('El monto máximo debe ser positivo')
        .min(0.01, 'El monto máximo debe ser al menos 0.01')
        .transform((val) => Math.round(val * 100))
        .optional(),
})
    .refine((data) => {
    // Validar que dateFrom <= dateTo si ambos están presentes
    if (data.dateFrom && data.dateTo && data.dateFrom > data.dateTo) {
        return false;
    }
    return true;
}, {
    message: 'La fecha de inicio (dateFrom) debe ser anterior o igual a la fecha de fin (dateTo)',
    path: ['dateTo'],
})
    .refine((data) => {
    // Validar que amountMin <= amountMax si ambos están presentes
    if (data.amountMin != null && data.amountMax != null && data.amountMin > data.amountMax) {
        return false;
    }
    return true;
}, {
    message: 'El monto mínimo (amountMin) debe ser menor o igual al monto máximo (amountMax)',
    path: ['amountMax'],
});
/**
 * Schema Zod para procesar reembolso
 */
export const ProcessRefundSchema = z.object({
    paymentId: z
        .string({
        message: 'El ID de pago es requerido y debe ser un texto',
    })
        .uuid({
        message: 'El ID de pago debe ser un UUID válido',
    }),
    amount: optionalAmountSchema,
    reason: z
        .string({
        message: 'La razón del reembolso debe ser un texto',
    })
        .trim()
        .max(500, {
        message: 'La razón del reembolso no puede exceder 500 caracteres',
    })
        .optional()
        .nullable(),
});
//# sourceMappingURL=payment.validator.js.map