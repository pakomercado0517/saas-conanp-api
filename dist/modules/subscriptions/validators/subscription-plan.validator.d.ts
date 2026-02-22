import { z } from 'zod';
/**
 * Schema Zod para crear plan de suscripción
 */
export declare const CreateSubscriptionPlanSchema: z.ZodObject<{
    name: z.ZodEnum<{
        free: "free";
        básico: "básico";
        profesional: "profesional";
        empresarial: "empresarial";
    }>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    priceMonthly: z.ZodNumber;
    priceYearly: z.ZodNumber;
    stripePriceIdMonthly: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    stripePriceIdYearly: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    stripeProductId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    features: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    maxOrganizations: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>>;
    maxUsers: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>>;
    maxEventos: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>>;
    maxActividades: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>>;
    active: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export type CreateSubscriptionPlanDTO = z.infer<typeof CreateSubscriptionPlanSchema>;
/**
 * Schema Zod para actualizar plan de suscripción
 */
export declare const UpdateSubscriptionPlanSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodEnum<{
        free: "free";
        básico: "básico";
        profesional: "profesional";
        empresarial: "empresarial";
    }>>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    priceMonthly: z.ZodOptional<z.ZodNumber>;
    priceYearly: z.ZodOptional<z.ZodNumber>;
    stripePriceIdMonthly: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    stripePriceIdYearly: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    stripeProductId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    features: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    maxOrganizations: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>>;
    maxUsers: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>>;
    maxEventos: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>>;
    maxActividades: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodNull]>>;
    active: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type UpdateSubscriptionPlanDTO = z.infer<typeof UpdateSubscriptionPlanSchema>;
/**
 * Schema Zod para listar planes de suscripción (query params: paginación y filtros)
 */
export declare const ListSubscriptionPlansSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        name: "name";
        active: "active";
        createdAt: "createdAt";
        updatedAt: "updatedAt";
        priceMonthly: "priceMonthly";
        priceYearly: "priceYearly";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    name: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    active: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
export type ListSubscriptionPlansDTO = z.infer<typeof ListSubscriptionPlansSchema>;
//# sourceMappingURL=subscription-plan.validator.d.ts.map