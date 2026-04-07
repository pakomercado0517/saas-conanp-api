import { z, registry } from '@/shared/swagger/index.js';
import { CreateSubscriptionCheckoutSessionSchema } from '../validators/subscription.validator.js';

registry.register('CreateSubscriptionCheckoutSession', CreateSubscriptionCheckoutSessionSchema);

const SubscriptionCheckoutSessionResponseSchema = registry.register(
  'SubscriptionCheckoutSessionResponse',
  z.object({
    url: z.string().url().describe('URL de Stripe Checkout; redirigir al usuario aquí'),
    sessionId: z.string().describe('ID de la sesión de Checkout (cs_...)'),
  })
);

registry.registerPath({
  method: 'post',
  path: '/api/v1/organizations/{organizationId}/subscriptions/checkout-session',
  summary: 'Crear sesión Stripe Checkout (suscripción)',
  description:
    'Crea una sesión en modo `subscription` para que el usuario complete el pago en la página alojada de Stripe. La suscripción en BD se actualiza vía webhooks (`customer.subscription.*`). Requiere admin del área. Si la dependencia tiene una fila `incomplete` / `incomplete_expired` con `sub_…` en Stripe, el backend cancela esa suscripción en Stripe y normaliza la fila a FREE antes de crear la sesión (reintento sin 409).',
  tags: ['Suscripciones'],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: 'organizationId',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'ID del área (ANP); alias organizationId en rutas legacy',
    },
  ],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/CreateSubscriptionCheckoutSession' },
        example: {
          planId: '550e8400-e29b-41d4-a716-446655440000',
          billingCycle: 'monthly',
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Sesión creada; usar `data.url` para redirigir',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: SubscriptionCheckoutSessionResponseSchema,
            message: z.string(),
          }),
        },
      },
    },
    400: { description: 'Validación' },
    401: { description: 'No autorizado' },
    403: { description: 'Sin permisos de admin o sin acceso al área' },
    409: {
      description:
        'Conflicto (suscripción existente no elegible para upgrade FREE; no aplica tras liberar incomplete automáticamente)',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/subscriptions/{subscriptionId}/release-incomplete',
  summary: 'Liberar suscripción incomplete para reintentar contratación',
  description:
    'Si la suscripción está en `incomplete` o `incomplete_expired` y aplica (p. ej. tiene `stripeSubscriptionId`), cancela en Stripe cuando corresponde y deja la fila en plan FREE activo sin `stripeSubscriptionId`/`stripePriceId`, conservando `stripeCustomerId`. Útil para soporte o botón "Reintentar" sin abrir Checkout. Requiere admin del área asociada.',
  tags: ['Suscripciones'],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: 'subscriptionId',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
    },
  ],
  responses: {
    200: {
      description: 'Suscripción normalizada a FREE',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.unknown(),
            message: z.string(),
          }),
        },
      },
    },
    400: { description: 'La suscripción no está en estado elegible para liberar' },
    401: { description: 'No autorizado' },
    403: { description: 'Sin permisos de admin' },
    404: { description: 'Suscripción no encontrada' },
  },
});
