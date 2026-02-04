import { z, registry } from '@/shared/swagger/index.js';
import {
  CreatePaymentIntentSchema,
  ConfirmPaymentSchema,
  ListPaymentsSchema,
  ProcessRefundSchema,
} from '../validators/payment.validator.js';

// Registrar schemas en el registry de OpenAPI
registry.register('CreatePaymentIntent', CreatePaymentIntentSchema);
registry.register('ConfirmPayment', ConfirmPaymentSchema);
registry.register('ListPayments', ListPaymentsSchema);
registry.register('ProcessRefund', ProcessRefundSchema);

// Schema para respuesta de Payment
const PaymentResponseSchema = registry.register(
  'PaymentResponse',
  z.object({
    id: z.string().uuid(),
    organizationId: z.string().uuid(),
    eventoId: z.string().uuid(),
    stripePaymentIntentId: z.string().nullable(),
    amount: z.number().int().positive(),
    currency: z.enum(['MXN', 'USD']),
    status: z.enum(['pending', 'processing', 'succeeded', 'failed', 'refunded', 'cancelled']),
    refundedAmount: z.number().int().min(0).nullable(),
    paymentMethod: z.string().max(50).nullable(),
    metadata: z.record(z.string(), z.unknown()).nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    // Relaciones
    evento: z
      .object({
        id: z.string().uuid(),
        name: z.string(),
        date: z.string(),
        peopleCount: z.number().int().positive(),
      })
      .optional(),
    organization: z
      .object({
        id: z.string().uuid(),
        name: z.string(),
      })
      .optional(),
  })
);

// Schema para respuesta de PaymentIntent
const PaymentIntentResponseSchema = registry.register(
  'PaymentIntentResponse',
  z.object({
    id: z.string().uuid(),
    organizationId: z.string().uuid(),
    eventoId: z.string().uuid(),
    stripePaymentIntentId: z.string(),
    clientSecret: z.string(),
    amount: z.number().int().positive(),
    currency: z.enum(['MXN', 'USD']),
    status: z.enum(['pending', 'processing', 'succeeded', 'failed', 'refunded', 'cancelled']),
    paymentMethod: z.string().max(50).nullable(),
    metadata: z.record(z.string(), z.unknown()).nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
);

// Schema para respuesta paginada de pagos
const PaginatedPaymentsResponseSchema = registry.register(
  'PaginatedPaymentsResponse',
  z.object({
    data: z.array(PaymentResponseSchema),
    pagination: z.object({
      page: z.number().int().positive(),
      limit: z.number().int().positive(),
      total: z.number().int().min(0),
      totalPages: z.number().int().min(0),
    }),
  })
);

// Registrar rutas en el registry
registry.registerPath({
  method: 'post',
  path: '/api/v1/organizations/{organizationId}/payments/intent',
  summary: 'Crear Payment Intent',
  description:
    'Crea un Payment Intent en Stripe y guarda el pago en la base de datos. El pago se crea con estado "pending" y se actualiza cuando se confirma.',
  tags: ['Pagos'],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: 'organizationId',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'ID de la organización',
    },
  ],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/CreatePaymentIntent' },
        example: {
          eventoId: '123e4567-e89b-12d3-a456-426614174000',
          amount: 150.5,
          currency: 'MXN',
          metadata: {
            notes: 'Pago por actividad de snorkel',
          },
          paymentMethod: 'card',
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Payment Intent creado exitosamente',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: PaymentIntentResponseSchema,
            message: z.string(),
          }),
          example: {
            success: true,
            data: {
              id: '123e4567-e89b-12d3-a456-426614174001',
              organizationId: '123e4567-e89b-12d3-a456-426614174000',
              eventoId: '123e4567-e89b-12d3-a456-426614174000',
              stripePaymentIntentId: 'pi_1234567890',
              clientSecret: 'pi_1234567890_secret_...',
              amount: 15050,
              currency: 'MXN',
              status: 'pending',
              paymentMethod: 'card',
              metadata: { notes: 'Pago por actividad de snorkel' },
              createdAt: '2024-01-15T10:30:00Z',
              updatedAt: '2024-01-15T10:30:00Z',
            },
            message: 'Payment Intent creado exitosamente',
          },
        },
      },
    },
    400: {
      description: 'Error de validación',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.string(),
            message: z.string(),
            details: z.array(
              z.object({
                campo: z.string(),
                mensaje: z.string(),
              })
            ),
          }),
        },
      },
    },
    401: {
      description: 'No autorizado',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    403: {
      description: 'Acceso denegado',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    429: {
      description: 'Demasiadas solicitudes',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/organizations/{organizationId}/payments/confirm',
  summary: 'Confirmar pago',
  description:
    'Confirma un pago actualizando el PaymentIntent en Stripe y el registro en la base de datos.',
  tags: ['Pagos'],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: 'organizationId',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'ID de la organización',
    },
  ],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ConfirmPayment' },
        example: {
          paymentId: '123e4567-e89b-12d3-a456-426614174001',
          stripePaymentIntentId: 'pi_1234567890',
          paymentMethod: 'card_visa',
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Pago confirmado exitosamente',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: PaymentResponseSchema,
            message: z.string(),
          }),
          example: {
            success: true,
            data: {
              id: '123e4567-e89b-12d3-a456-426614174001',
              organizationId: '123e4567-e89b-12d3-a456-426614174000',
              eventoId: '123e4567-e89b-12d3-a456-426614174000',
              stripePaymentIntentId: 'pi_1234567890',
              amount: 15050,
              currency: 'MXN',
              status: 'succeeded',
              refundedAmount: null,
              paymentMethod: 'card_visa',
              metadata: { notes: 'Pago por actividad de snorkel' },
              createdAt: '2024-01-15T10:30:00Z',
              updatedAt: '2024-01-15T10:35:00Z',
              evento: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Snorkel en arrecife',
                date: '2024-01-20',
                peopleCount: 8,
              },
              organization: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'ANP Isla Mujeres',
              },
            },
            message: 'Pago confirmado exitosamente',
          },
        },
      },
    },
    400: {
      description: 'Error de validación',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.string(),
            message: z.string(),
            details: z.array(
              z.object({
                campo: z.string(),
                mensaje: z.string(),
              })
            ),
          }),
        },
      },
    },
    401: {
      description: 'No autorizado',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    403: {
      description: 'Acceso denegado',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    404: {
      description: 'Pago no encontrado',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/organizations/{organizationId}/payments',
  summary: 'Listar pagos',
  description:
    'Lista pagos con paginación y filtros. Solo se muestran pagos de la organización a la que el usuario tiene acceso.',
  tags: ['Pagos'],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: 'organizationId',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'ID de la organización',
    },
    {
      name: 'page',
      in: 'query',
      schema: { type: 'integer', minimum: 1, default: 1 },
      description: 'Número de página',
    },
    {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      description: 'Límite de resultados por página',
    },
    {
      name: 'sortBy',
      in: 'query',
      schema: {
        type: 'string',
        enum: ['amount', 'currency', 'status', 'createdAt', 'updatedAt', 'refundedAmount'],
      },
      description: 'Campo por el cual ordenar',
    },
    {
      name: 'sortOrder',
      in: 'query',
      schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
      description: 'Orden de clasificación',
    },
    {
      name: 'eventoId',
      in: 'query',
      schema: { type: 'string', format: 'uuid' },
      description: 'Filtrar por ID de evento',
    },
    {
      name: 'status',
      in: 'query',
      schema: {
        type: 'string',
        enum: ['pending', 'processing', 'succeeded', 'failed', 'refunded', 'cancelled'],
      },
      description: 'Filtrar por estado del pago',
    },
    {
      name: 'currency',
      in: 'query',
      schema: { type: 'string', enum: ['MXN', 'USD'] },
      description: 'Filtrar por moneda',
    },
    {
      name: 'dateFrom',
      in: 'query',
      schema: { type: 'string', format: 'date' },
      description: 'Fecha de inicio (YYYY-MM-DD)',
    },
    {
      name: 'dateTo',
      in: 'query',
      schema: { type: 'string', format: 'date' },
      description: 'Fecha de fin (YYYY-MM-DD)',
    },
    {
      name: 'amountMin',
      in: 'query',
      schema: { type: 'number', minimum: 0.01 },
      description: 'Monto mínimo en decimales',
    },
    {
      name: 'amountMax',
      in: 'query',
      schema: { type: 'number', minimum: 0.01 },
      description: 'Monto máximo en decimales',
    },
  ],
  responses: {
    200: {
      description: 'Pagos obtenidos exitosamente',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: PaginatedPaymentsResponseSchema.shape.data,
            pagination: PaginatedPaymentsResponseSchema.shape.pagination,
            message: z.string(),
          }),
          example: {
            success: true,
            data: [
              {
                id: '123e4567-e89b-12d3-a456-426614174001',
                organizationId: '123e4567-e89b-12d3-a456-426614174000',
                eventoId: '123e4567-e89b-12d3-a456-426614174000',
                stripePaymentIntentId: 'pi_1234567890',
                amount: 15050,
                currency: 'MXN',
                status: 'succeeded',
                refundedAmount: null,
                paymentMethod: 'card_visa',
                metadata: { notes: 'Pago por actividad de snorkel' },
                createdAt: '2024-01-15T10:30:00Z',
                updatedAt: '2024-01-15T10:35:00Z',
                evento: {
                  id: '123e4567-e89b-12d3-a456-426614174000',
                  name: 'Snorkel en arrecife',
                  date: '2024-01-20',
                  peopleCount: 8,
                },
                organization: {
                  id: '123e4567-e89b-12d3-a456-426614174000',
                  name: 'ANP Isla Mujeres',
                },
              },
            ],
            pagination: {
              page: 1,
              limit: 20,
              total: 1,
              totalPages: 1,
            },
            message: 'Pagos obtenidos exitosamente',
          },
        },
      },
    },
    400: {
      description: 'Error de validación',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.string(),
            message: z.string(),
            details: z.array(
              z.object({
                campo: z.string(),
                mensaje: z.string(),
              })
            ),
          }),
        },
      },
    },
    401: {
      description: 'No autorizado',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    403: {
      description: 'Acceso denegado',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/organizations/{organizationId}/payments/{paymentId}',
  summary: 'Obtener pago por ID',
  description:
    'Obtiene un pago por ID. Solo se puede ver si el pago pertenece a la organización del usuario.',
  tags: ['Pagos'],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: 'organizationId',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'ID de la organización',
    },
    {
      name: 'paymentId',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'ID del pago',
    },
  ],
  responses: {
    200: {
      description: 'Pago obtenido exitosamente',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: PaymentResponseSchema,
            message: z.string(),
          }),
          example: {
            success: true,
            data: {
              id: '123e4567-e89b-12d3-a456-426614174001',
              organizationId: '123e4567-e89b-12d3-a456-426614174000',
              eventoId: '123e4567-e89b-12d3-a456-426614174000',
              stripePaymentIntentId: 'pi_1234567890',
              amount: 15050,
              currency: 'MXN',
              status: 'succeeded',
              refundedAmount: null,
              paymentMethod: 'card_visa',
              metadata: { notes: 'Pago por actividad de snorkel' },
              createdAt: '2024-01-15T10:30:00Z',
              updatedAt: '2024-01-15T10:35:00Z',
              evento: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Snorkel en arrecife',
                date: '2024-01-20',
                peopleCount: 8,
              },
              organization: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'ANP Isla Mujeres',
              },
            },
            message: 'Pago obtenido exitosamente',
          },
        },
      },
    },
    401: {
      description: 'No autorizado',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    403: {
      description: 'Acceso denegado',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    404: {
      description: 'Pago no encontrado',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/organizations/{organizationId}/payments/refund',
  summary: 'Procesar reembolso',
  description:
    'Procesa un reembolso para un pago. Puede ser reembolso total (si no se proporciona amount) o parcial (si se proporciona amount). Solo los administradores pueden procesar reembolsos.',
  tags: ['Pagos'],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: 'organizationId',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'ID de la organización',
    },
  ],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ProcessRefund' },
        example: {
          paymentId: '123e4567-e89b-12d3-a456-426614174001',
          amount: 75.25,
          reason: 'Cancelación por lluvia',
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Reembolso procesado exitosamente',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: PaymentResponseSchema,
            message: z.string(),
          }),
          example: {
            success: true,
            data: {
              id: '123e4567-e89b-12d3-a456-426614174001',
              organizationId: '123e4567-e89b-12d3-a456-426614174000',
              eventoId: '123e4567-e89b-12d3-a456-426614174000',
              stripePaymentIntentId: 'pi_1234567890',
              amount: 15050,
              currency: 'MXN',
              status: 'refunded',
              refundedAmount: 7525,
              paymentMethod: 'card_visa',
              metadata: { notes: 'Pago por actividad de snorkel' },
              createdAt: '2024-01-15T10:30:00Z',
              updatedAt: '2024-01-15T14:20:00Z',
              evento: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Snorkel en arrecife',
                date: '2024-01-20',
                peopleCount: 8,
              },
              organization: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'ANP Isla Mujeres',
              },
            },
            message: 'Reembolso procesado exitosamente',
          },
        },
      },
    },
    400: {
      description: 'Error de validación o reembolso inválido',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.string(),
            message: z.string(),
            details: z
              .array(
                z.object({
                  campo: z.string(),
                  mensaje: z.string(),
                })
              )
              .optional(),
          }),
        },
      },
    },
    401: {
      description: 'No autorizado',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    403: {
      description: 'Acceso denegado (solo administradores)',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    404: {
      description: 'Pago no encontrado',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(false),
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
  },
});
