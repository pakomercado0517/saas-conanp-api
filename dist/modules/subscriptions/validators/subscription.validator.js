import { z } from 'zod';
import { optionalDateTimeSchema } from '@/shared/dates/zod-schemas.js';
// Enum reutilizable para ciclo de facturación
const BILLING_CYCLES = ['monthly', 'yearly'];
/**
 * Schema Zod para validar billingCycle (monthly | yearly)
 */
export const billingCycleSchema = z.enum(BILLING_CYCLES, {
    error: 'El ciclo de facturación debe ser: monthly o yearly',
});
// Enum para estados de suscripción (para listado y filtros)
const SUBSCRIPTION_STATUSES_TUPLE = [
    'active',
    'canceled',
    'past_due',
    'unpaid',
    'trialing',
    'incomplete',
    'incomplete_expired',
];
const subscriptionStatusEnum = z.enum(SUBSCRIPTION_STATUSES_TUPLE, {
    error: `El estado debe ser uno de: ${SUBSCRIPTION_STATUSES_TUPLE.join(', ')}`,
});
// Schema para UUID de plan
const planIdSchema = z
    .string({
    message: 'El ID del plan es requerido y debe ser un texto',
})
    .uuid({
    message: 'El ID del plan debe ser un UUID válido',
});
/**
 * Schema Zod para crear suscripción
 * organizationId viene del path :orgId
 */
export const CreateSubscriptionSchema = z.object({
    planId: planIdSchema,
    billingCycle: billingCycleSchema,
    paymentMethodId: z
        .string({
        message: 'El método de pago debe ser un texto',
    })
        .trim()
        .max(255, 'paymentMethodId no puede exceder 255 caracteres')
        .optional()
        .nullable(),
    trialEnd: optionalDateTimeSchema.transform((val) => (val === null ? undefined : val)).optional(),
});
/**
 * Schema Zod para actualizar suscripción (cambio de plan)
 */
export const UpdateSubscriptionSchema = z
    .object({
    planId: planIdSchema.optional(),
    billingCycle: billingCycleSchema.optional(),
    prorate: z
        .boolean({
        message: 'prorate debe ser un valor booleano',
    })
        .optional(),
})
    .refine((data) => Object.keys(data).some((k) => data[k] !== undefined), {
    message: 'Debe incluir al menos un campo para actualizar (planId, billingCycle o prorate)',
});
/**
 * Schema Zod para cancelar suscripción
 */
export const CancelSubscriptionSchema = z.object({
    cancelAtPeriodEnd: z
        .boolean({
        message: 'cancelAtPeriodEnd debe ser un valor booleano',
    })
        .optional()
        .default(true),
    reason: z
        .string({
        message: 'La razón de cancelación debe ser un texto',
    })
        .trim()
        .max(500, 'La razón de cancelación no puede exceder 500 caracteres')
        .optional()
        .nullable(),
});
/**
 * Schema Zod para reactivar suscripción
 * La reactivación se realiza por subscriptionId en el path. Body vacío.
 */
export const ReactivateSubscriptionSchema = z.object({}).strict();
// Campos permitidos para ordenamiento en listado
const SORT_FIELDS = [
    'status',
    'billingCycle',
    'currentPeriodEnd',
    'createdAt',
    'organizationId',
    'planId',
];
/**
 * Schema Zod para listar suscripciones (query params: paginación y filtros)
 */
export const ListSubscriptionsSchema = z.object({
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
    status: subscriptionStatusEnum.optional(),
    billingCycle: billingCycleSchema.optional(),
    organizationId: z
        .string()
        .uuid({
        message: 'El ID de organización debe ser un UUID válido',
    })
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
    planId: z
        .string()
        .uuid({
        message: 'El ID del plan debe ser un UUID válido',
    })
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
});
//# sourceMappingURL=subscription.validator.js.map