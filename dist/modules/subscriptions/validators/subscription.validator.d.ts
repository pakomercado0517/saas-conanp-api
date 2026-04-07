import { z } from 'zod';
/**
 * Schema Zod para validar billingCycle (monthly | yearly)
 */
export declare const billingCycleSchema: z.ZodEnum<{
    monthly: "monthly";
    yearly: "yearly";
}>;
/**
 * Schema Zod para crear suscripción
 * organizationId viene del path :orgId
 */
export declare const CreateSubscriptionSchema: z.ZodObject<{
    planId: z.ZodString;
    billingCycle: z.ZodEnum<{
        monthly: "monthly";
        yearly: "yearly";
    }>;
    paymentMethodId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    trialEnd: z.ZodOptional<z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>, z.ZodTransform<import("luxon").DateTime<boolean> | undefined, import("luxon").DateTime<boolean> | null | undefined>>>;
}, z.core.$strip>;
export type CreateSubscriptionDTO = z.infer<typeof CreateSubscriptionSchema>;
/**
 * Schema para crear sesión de Stripe Checkout (suscripción en página alojada de Stripe).
 * Mismos campos base que crear suscripción, sin paymentMethodId.
 */
export declare const CreateSubscriptionCheckoutSessionSchema: z.ZodObject<{
    planId: z.ZodString;
    billingCycle: z.ZodEnum<{
        monthly: "monthly";
        yearly: "yearly";
    }>;
    trialEnd: z.ZodOptional<z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<import("luxon").DateTime<boolean>, string>>>>, z.ZodTransform<import("luxon").DateTime<boolean> | undefined, import("luxon").DateTime<boolean> | null | undefined>>>;
}, z.core.$strip>;
export type CreateSubscriptionCheckoutSessionDTO = z.infer<typeof CreateSubscriptionCheckoutSessionSchema>;
/**
 * Schema Zod para actualizar suscripción (cambio de plan)
 */
export declare const UpdateSubscriptionSchema: z.ZodObject<{
    planId: z.ZodOptional<z.ZodString>;
    billingCycle: z.ZodOptional<z.ZodEnum<{
        monthly: "monthly";
        yearly: "yearly";
    }>>;
    prorate: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type UpdateSubscriptionDTO = z.infer<typeof UpdateSubscriptionSchema>;
/**
 * Schema Zod para cancelar suscripción
 */
export declare const CancelSubscriptionSchema: z.ZodObject<{
    cancelAtPeriodEnd: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    reason: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type CancelSubscriptionDTO = z.infer<typeof CancelSubscriptionSchema>;
/**
 * Schema Zod para reactivar suscripción
 * La reactivación se realiza por subscriptionId en el path. Body vacío.
 */
export declare const ReactivateSubscriptionSchema: z.ZodObject<{}, z.core.$strict>;
export type ReactivateSubscriptionDTO = z.infer<typeof ReactivateSubscriptionSchema>;
/**
 * Schema Zod para listar suscripciones (query params: paginación y filtros)
 */
export declare const ListSubscriptionsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        createdAt: "createdAt";
        status: "status";
        organizationId: "organizationId";
        planId: "planId";
        billingCycle: "billingCycle";
        currentPeriodEnd: "currentPeriodEnd";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        active: "active";
        canceled: "canceled";
        past_due: "past_due";
        unpaid: "unpaid";
        trialing: "trialing";
        incomplete: "incomplete";
        incomplete_expired: "incomplete_expired";
    }>>;
    billingCycle: z.ZodOptional<z.ZodEnum<{
        monthly: "monthly";
        yearly: "yearly";
    }>>;
    organizationId: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    planId: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
}, z.core.$strip>;
export type ListSubscriptionsDTO = z.infer<typeof ListSubscriptionsSchema>;
//# sourceMappingURL=subscription.validator.d.ts.map