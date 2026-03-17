import { z } from 'zod';

// Helpers reutilizables

const PLAN_NAMES = ['free', 'básico', 'profesional', 'empresarial', 'enterprise'] as const;
const planNameEnum = z.enum(PLAN_NAMES, {
  error: 'El nombre del plan debe ser: free, básico, profesional, empresarial o enterprise',
});

const priceSchema = z.union([
  z.number({ message: 'El precio debe ser un número' }).min(0, 'El precio no puede ser negativo'),
  z.null(),
]);

const limitPositiveSchema = z
  .union([z.number().int('Debe ser un número entero').min(1, 'Debe ser al menos 1'), z.null()])
  .optional();

const limitNonNegativeSchema = z
  .union([z.number().int('Debe ser un número entero').min(0, 'No puede ser negativo'), z.null()])
  .optional();

const featuresSchema = z.record(z.string(), z.unknown()).refine((val) => !Array.isArray(val), {
  message: 'features debe ser un objeto',
});

// Schema para crear plan

/**
 * Schema Zod para crear plan de suscripción
 */
export const CreateSubscriptionPlanSchema = z.object({
  name: planNameEnum,
  description: z
    .string({
      message: 'La descripción debe ser un texto',
    })
    .trim()
    .optional()
    .nullable(),
  priceMonthly: priceSchema,
  priceYearly: priceSchema,
  stripePriceIdMonthly: z
    .string()
    .trim()
    .max(255, 'stripePriceIdMonthly no puede exceder 255 caracteres')
    .optional()
    .nullable(),
  stripePriceIdYearly: z
    .string()
    .trim()
    .max(255, 'stripePriceIdYearly no puede exceder 255 caracteres')
    .optional()
    .nullable(),
  stripeProductId: z
    .string()
    .trim()
    .max(255, 'stripeProductId no puede exceder 255 caracteres')
    .optional()
    .nullable(),
  features: featuresSchema.optional().nullable(),
  maxOrganizations: limitPositiveSchema,
  maxUsers: limitPositiveSchema,
  maxEventos: limitNonNegativeSchema,
  maxActividades: limitNonNegativeSchema,
  active: z.boolean().optional().default(true),
});

export type CreateSubscriptionPlanDTO = z.infer<typeof CreateSubscriptionPlanSchema>;

// Schema para actualizar plan

const optionalPriceSchema = priceSchema.optional();

/**
 * Schema Zod para actualizar plan de suscripción
 */
export const UpdateSubscriptionPlanSchema = z
  .object({
    name: planNameEnum.optional(),
    description: z.string().trim().optional().nullable(),
    priceMonthly: optionalPriceSchema,
    priceYearly: optionalPriceSchema,
    stripePriceIdMonthly: z
      .string()
      .trim()
      .max(255, 'stripePriceIdMonthly no puede exceder 255 caracteres')
      .optional()
      .nullable(),
    stripePriceIdYearly: z
      .string()
      .trim()
      .max(255, 'stripePriceIdYearly no puede exceder 255 caracteres')
      .optional()
      .nullable(),
    stripeProductId: z
      .string()
      .trim()
      .max(255, 'stripeProductId no puede exceder 255 caracteres')
      .optional()
      .nullable(),
    features: featuresSchema.optional().nullable(),
    maxOrganizations: limitPositiveSchema,
    maxUsers: limitPositiveSchema,
    maxEventos: limitNonNegativeSchema,
    maxActividades: limitNonNegativeSchema,
    active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).some((k) => data[k as keyof typeof data] !== undefined), {
    message: 'Debe incluir al menos un campo para actualizar',
  });

export type UpdateSubscriptionPlanDTO = z.infer<typeof UpdateSubscriptionPlanSchema>;

// Schema para listar planes

const SORT_FIELDS = [
  'name',
  'active',
  'priceMonthly',
  'priceYearly',
  'createdAt',
  'updatedAt',
] as const;

/**
 * Schema Zod para listar planes de suscripción (query params: paginación y filtros)
 */
export const ListSubscriptionPlansSchema = z.object({
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
  name: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  active: z.coerce
    .boolean({
      message: 'active debe ser un valor booleano',
    })
    .optional(),
});

export type ListSubscriptionPlansDTO = z.infer<typeof ListSubscriptionPlansSchema>;
