import { z, registry, commonErrorResponses } from '@/shared/swagger/index.js';
import {
  CreateActividadSchema,
  UpdateActividadSchema,
  ListActividadesSchema,
} from '../validators/actividad.validator.js';

/**
 * Schema de actividad en respuestas
 */
const ActividadSchema = registry.register(
  'Actividad',
  z.object({
    id: z.string().uuid().describe('ID único de la actividad'),
    organizationId: z.string().uuid().describe('ID de la organización (ANP)'),
    name: z.string().describe('Nombre de la actividad turística'),
    type: z
      .enum(['terrestre', 'maritima', 'mixta'])
      .describe('Tipo de actividad según el ecosistema'),
    agendaType: z
      .enum(['BLOQUES', 'HORARIO_LIBRE'])
      .describe('Tipo de agenda: BLOQUES (horarios predefinidos) o HORARIO_LIBRE'),
    requiresGuide: z.boolean().describe('Indica si requiere guía obligatoriamente'),
    impactLevel: z
      .string()
      .nullable()
      .describe('Nivel de impacto ambiental (ej: bajo, medio, alto)'),
    active: z.boolean().describe('Indica si la actividad está activa'),
    createdAt: z.string().datetime().describe('Fecha de creación'),
    updatedAt: z.string().datetime().describe('Fecha de última actualización'),
  })
);

/**
 * Schema de respuesta de actividad
 */
const ActividadResponseSchema = registry.register(
  'ActividadResponse',
  z.object({
    success: z.literal(true).describe('Indica que la operación fue exitosa'),
    data: ActividadSchema.describe('Datos de la actividad'),
    message: z.string().optional().describe('Mensaje descriptivo opcional'),
    timestamp: z.string().datetime().optional().describe('Marca de tiempo de la respuesta'),
  })
);

/**
 * Schema de respuesta paginada de actividades
 */
const ActividadListResponseSchema = registry.register(
  'ActividadListResponse',
  z.object({
    success: z.literal(true).describe('Indica que la operación fue exitosa'),
    data: z.array(ActividadSchema).describe('Lista de actividades'),
    pagination: z.object({
      page: z.number().describe('Página actual'),
      limit: z.number().describe('Elementos por página'),
      total: z.number().describe('Total de elementos'),
      totalPages: z.number().describe('Total de páginas'),
    }),
    message: z.string().optional().describe('Mensaje descriptivo opcional'),
    timestamp: z.string().datetime().optional().describe('Marca de tiempo de la respuesta'),
  })
);

/**
 * Registrar rutas de actividades en OpenAPI
 */

// POST /api/v1/organizations/:organizationId/actividades
registry.registerPath({
  method: 'post',
  path: '/api/v1/organizations/{organizationId}/actividades',
  tags: ['Actividades'],
  summary: 'Crear nueva actividad',
  description:
    'Crea una nueva actividad turística en una organización (ANP). Solo administradores pueden crear actividades. La actividad define qué tipo de operación turística puede realizarse, su tipo de agenda (bloques predefinidos o horario libre), y reglas como si requiere guía.',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      organizationId: z.string().uuid().describe('ID de la organización'),
    }),
    body: {
      content: {
        'application/json': {
          schema: CreateActividadSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Actividad creada exitosamente',
      content: {
        'application/json': {
          schema: ActividadResponseSchema,
          examples: {
            bloques: {
              summary: 'Actividad con bloques (marítima)',
              value: {
                success: true,
                data: {
                  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                  organizationId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
                  name: 'Snorkel en arrecife',
                  type: 'maritima',
                  agendaType: 'BLOQUES',
                  requiresGuide: true,
                  impactLevel: 'medio',
                  active: true,
                  createdAt: '2026-02-03T10:00:00.000Z',
                  updatedAt: '2026-02-03T10:00:00.000Z',
                },
                message: 'Actividad creada exitosamente',
                timestamp: '2026-02-03T10:00:00.000Z',
              },
            },
            horarioLibre: {
              summary: 'Actividad con horario libre (terrestre)',
              value: {
                success: true,
                data: {
                  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
                  organizationId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
                  name: 'Senderismo interpretativo',
                  type: 'terrestre',
                  agendaType: 'HORARIO_LIBRE',
                  requiresGuide: false,
                  impactLevel: 'bajo',
                  active: true,
                  createdAt: '2026-02-03T10:05:00.000Z',
                  updatedAt: '2026-02-03T10:05:00.000Z',
                },
                message: 'Actividad creada exitosamente',
                timestamp: '2026-02-03T10:05:00.000Z',
              },
            },
          },
        },
      },
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    403: commonErrorResponses[403],
    500: commonErrorResponses[500],
  },
});

// GET /api/v1/organizations/:organizationId/actividades
registry.registerPath({
  method: 'get',
  path: '/api/v1/organizations/{organizationId}/actividades',
  tags: ['Actividades'],
  summary: 'Listar actividades',
  description:
    'Obtiene la lista de actividades de una organización con paginación y filtros. Permite filtrar por tipo, tipo de agenda, estado activo, y si requiere guía. Cualquier usuario con acceso a la organización puede listar actividades.',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      organizationId: z.string().uuid().describe('ID de la organización'),
    }),
    query: ListActividadesSchema,
  },
  responses: {
    200: {
      description: 'Lista de actividades obtenida exitosamente',
      content: {
        'application/json': {
          schema: ActividadListResponseSchema,
          examples: {
            success: {
              summary: 'Lista con paginación',
              value: {
                success: true,
                data: [
                  {
                    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                    organizationId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
                    name: 'Snorkel en arrecife',
                    type: 'maritima',
                    agendaType: 'BLOQUES',
                    requiresGuide: true,
                    impactLevel: 'medio',
                    active: true,
                    createdAt: '2026-02-01T10:00:00.000Z',
                    updatedAt: '2026-02-01T10:00:00.000Z',
                  },
                  {
                    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
                    organizationId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
                    name: 'Kayak en manglar',
                    type: 'maritima',
                    agendaType: 'HORARIO_LIBRE',
                    requiresGuide: false,
                    impactLevel: 'bajo',
                    active: true,
                    createdAt: '2026-01-25T12:00:00.000Z',
                    updatedAt: '2026-01-25T12:00:00.000Z',
                  },
                ],
                pagination: {
                  page: 1,
                  limit: 20,
                  total: 2,
                  totalPages: 1,
                },
                message: 'Actividades obtenidas exitosamente',
                timestamp: '2026-02-03T10:00:00.000Z',
              },
            },
          },
        },
      },
    },
    401: commonErrorResponses[401],
    403: commonErrorResponses[403],
    500: commonErrorResponses[500],
  },
});

// GET /api/v1/organizations/:organizationId/actividades/:actividadId
registry.registerPath({
  method: 'get',
  path: '/api/v1/organizations/{organizationId}/actividades/{actividadId}',
  tags: ['Actividades'],
  summary: 'Obtener actividad por ID',
  description:
    'Obtiene los detalles completos de una actividad específica. Cualquier usuario con acceso a la organización puede obtener actividades.',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      organizationId: z.string().uuid().describe('ID de la organización'),
      actividadId: z.string().uuid().describe('ID de la actividad'),
    }),
  },
  responses: {
    200: {
      description: 'Actividad obtenida exitosamente',
      content: {
        'application/json': {
          schema: ActividadResponseSchema,
          examples: {
            success: {
              summary: 'Actividad obtenida',
              value: {
                success: true,
                data: {
                  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                  organizationId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
                  name: 'Snorkel en arrecife',
                  type: 'maritima',
                  agendaType: 'BLOQUES',
                  requiresGuide: true,
                  impactLevel: 'medio',
                  active: true,
                  createdAt: '2026-02-01T10:00:00.000Z',
                  updatedAt: '2026-02-01T10:00:00.000Z',
                },
                message: 'Actividad obtenida exitosamente',
                timestamp: '2026-02-03T10:00:00.000Z',
              },
            },
          },
        },
      },
    },
    401: commonErrorResponses[401],
    403: commonErrorResponses[403],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500],
  },
});

// PATCH /api/v1/organizations/:organizationId/actividades/:actividadId
registry.registerPath({
  method: 'patch',
  path: '/api/v1/organizations/{organizationId}/actividades/{actividadId}',
  tags: ['Actividades'],
  summary: 'Actualizar actividad',
  description:
    'Actualiza una actividad existente. Solo administradores pueden actualizar actividades. Al menos un campo es requerido. Se puede cambiar el tipo de agenda, nombre, nivel de impacto, etc.',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      organizationId: z.string().uuid().describe('ID de la organización'),
      actividadId: z.string().uuid().describe('ID de la actividad a actualizar'),
    }),
    body: {
      content: {
        'application/json': {
          schema: UpdateActividadSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Actividad actualizada exitosamente',
      content: {
        'application/json': {
          schema: ActividadResponseSchema,
          examples: {
            success: {
              summary: 'Actividad actualizada',
              value: {
                success: true,
                data: {
                  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                  organizationId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
                  name: 'Snorkel en arrecife - Actualizado',
                  type: 'maritima',
                  agendaType: 'BLOQUES',
                  requiresGuide: true,
                  impactLevel: 'bajo',
                  active: true,
                  createdAt: '2026-02-01T10:00:00.000Z',
                  updatedAt: '2026-02-03T14:30:00.000Z',
                },
                message: 'Actividad actualizada exitosamente',
                timestamp: '2026-02-03T14:30:00.000Z',
              },
            },
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
            code: z.string(),
          }),
          examples: {
            noFields: {
              summary: 'Sin campos para actualizar',
              value: {
                success: false,
                error: 'Error de validación',
                message: 'Debe incluir al menos un campo para actualizar',
                code: 'VALIDATION_ERROR',
              },
            },
          },
        },
      },
    },
    401: commonErrorResponses[401],
    403: commonErrorResponses[403],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500],
  },
});

// DELETE /api/v1/organizations/:organizationId/actividades/:actividadId
registry.registerPath({
  method: 'delete',
  path: '/api/v1/organizations/{organizationId}/actividades/{actividadId}',
  tags: ['Actividades'],
  summary: 'Eliminar actividad',
  description:
    'Elimina una actividad (soft delete). Solo administradores pueden eliminar actividades. La actividad se marca como eliminada pero no se borra de la base de datos, permitiendo auditoría histórica.',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      organizationId: z.string().uuid().describe('ID de la organización'),
      actividadId: z.string().uuid().describe('ID de la actividad a eliminar'),
    }),
  },
  responses: {
    204: {
      description: 'Actividad eliminada exitosamente (sin contenido en respuesta)',
    },
    401: commonErrorResponses[401],
    403: commonErrorResponses[403],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500],
  },
});
