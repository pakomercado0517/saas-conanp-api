import { z, registry } from '@/shared/swagger/index.js';
import { ListSubscriptionPlansSchema } from '../validators/subscription-plan.validator.js';

/**
 * Schema de plan de suscripción en respuestas.
 * Precios en MXN; priceMonthly es el precio de referencia mensual.
 */
const SubscriptionPlanSchema = registry.register(
  'SubscriptionPlan',
  z.object({
    id: z.string().uuid().describe('ID único del plan'),
    name: z
      .string()
      .describe('Nombre del plan: free, básico, profesional, empresarial, enterprise'),
    description: z.string().nullable().describe('Descripción del plan'),
    priceMonthly: z
      .number()
      .nullable()
      .describe('Precio mensual en MXN. null en plan Enterprise (a medida).'),
    priceYearly: z
      .number()
      .nullable()
      .describe('Precio anual en MXN. null en plan Enterprise (a medida).'),
    stripePriceIdMonthly: z
      .string()
      .nullable()
      .optional()
      .describe('ID de precio Stripe (mensual)'),
    stripePriceIdYearly: z.string().nullable().optional().describe('ID de precio Stripe (anual)'),
    stripeProductId: z.string().nullable().optional().describe('ID de producto Stripe'),
    features: z
      .object({
        limits: z
          .record(z.string(), z.number())
          .optional()
          .describe(
            'Límites adicionales por plan (ej. areas, prestadores, activos). FREE usa 1 en cada uno.'
          ),
        functionalities: z
          .array(z.string())
          .optional()
          .describe('Lista de funcionalidades habilitadas (ej. reportes_avanzados, sandbox).'),
      })
      .passthrough()
      .nullable()
      .describe('Objeto de características y límites extra del plan'),
    maxOrganizations: z
      .number()
      .int()
      .positive()
      .nullable()
      .describe('Máximo de organizaciones/dependencias (null = sin límite; Enterprise multi-dep).'),
    maxUsers: z
      .number()
      .int()
      .nullable()
      .describe('Máximo de usuarios por dependencia (null = sin límite).'),
    maxEventos: z
      .number()
      .int()
      .nullable()
      .describe('Máximo de eventos por periodo de facturación (null = sin límite).'),
    maxActividades: z
      .number()
      .int()
      .nullable()
      .describe('Máximo de actividades activas por dependencia (null = sin límite).'),
    active: z.boolean().describe('Si el plan está activo y disponible para nuevas suscripciones'),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
  })
);

const SubscriptionPlanResponseSchema = registry.register(
  'SubscriptionPlanResponse',
  z.object({
    success: z.literal(true),
    data: SubscriptionPlanSchema,
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
  })
);

const SubscriptionPlanListResponseSchema = registry.register(
  'SubscriptionPlanListResponse',
  z.object({
    success: z.literal(true),
    data: z.array(SubscriptionPlanSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
  })
);

// GET /api/v1/subscription-plans
registry.registerPath({
  method: 'get',
  path: '/api/v1/subscription-plans',
  tags: ['Planes de Suscripción'],
  summary: 'Listar planes de suscripción',
  description:
    'Lista los planes disponibles con precios mensuales en MXN, límites (usuarios, eventos, actividades) y features. Público; no requiere autenticación. Útil para mostrar comparativa en el frontend.',
  request: {
    query: ListSubscriptionPlansSchema,
  },
  responses: {
    200: {
      description: 'Lista de planes con paginación',
      content: {
        'application/json': {
          schema: SubscriptionPlanListResponseSchema,
        },
      },
    },
  },
});

// GET /api/v1/subscription-plans/:planId
registry.registerPath({
  method: 'get',
  path: '/api/v1/subscription-plans/{planId}',
  tags: ['Planes de Suscripción'],
  summary: 'Obtener un plan por ID',
  description:
    'Devuelve un plan con precios en MXN (priceMonthly como referencia mensual), límites y features. Público.',
  request: {
    params: z.object({
      planId: z.string().uuid().describe('ID del plan'),
    }),
  },
  responses: {
    200: {
      description: 'Plan encontrado',
      content: {
        'application/json': {
          schema: SubscriptionPlanResponseSchema,
        },
      },
    },
    404: {
      description: 'Plan no encontrado',
    },
  },
});
