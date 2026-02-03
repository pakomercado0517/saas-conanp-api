import { z, registry, commonErrorResponses } from '../../../shared/swagger/index.js';
import { CreateBloqueSchema, CreateBloqueFromTemplateSchema, UpdateBloqueSchema, ListBloquesSchema, } from '../../actividades/validators/bloque.validator.js';
const BloqueSchema = registry.register('Bloque', z.object({
    id: z.string().uuid().describe('ID único del bloque'),
    organizationId: z.string().uuid().describe('ID de la organización (ANP)'),
    actividadId: z.string().uuid().describe('ID de la actividad asociada'),
    date: z.string().nullable().describe('Fecha del bloque (YYYY-MM-DD) o null si es plantilla'),
    startTime: z.string().describe('Hora de inicio (HH:mm:ss)'),
    endTime: z.string().describe('Hora de fin (HH:mm:ss)'),
    capacity: z.number().int().describe('Capacidad máxima de personas para el bloque'),
    isTemplate: z.boolean().describe('Indica si es una plantilla de bloque'),
    createdAt: z.string().datetime().describe('Fecha de creación'),
    updatedAt: z.string().datetime().describe('Fecha de última actualización'),
}));
const BloqueResponseSchema = registry.register('BloqueResponse', z.object({
    success: z.literal(true).describe('Indica que la operación fue exitosa'),
    data: BloqueSchema.describe('Datos del bloque'),
    message: z.string().optional().describe('Mensaje opcional'),
    timestamp: z.string().datetime().optional().describe('Marca de tiempo de la respuesta'),
}));
const BloqueListResponseSchema = registry.register('BloqueListResponse', z.object({
    success: z.literal(true).describe('Indica que la operación fue exitosa'),
    data: z.array(BloqueSchema).describe('Lista de bloques'),
    pagination: z.object({
        page: z.number().describe('Página actual'),
        limit: z.number().describe('Elementos por página'),
        total: z.number().describe('Total de elementos'),
        totalPages: z.number().describe('Total de páginas'),
    }),
    message: z.string().optional().describe('Mensaje opcional'),
    timestamp: z.string().datetime().optional().describe('Marca de tiempo de la respuesta'),
}));
// POST crear bloque
registry.registerPath({
    method: 'post',
    path: '/api/v1/organizations/{organizationId}/bloques',
    tags: ['Bloques'],
    summary: 'Crear bloque',
    description: 'Crea un nuevo bloque horario para una actividad. Puede ser una plantilla (`isTemplate=true`) o un bloque con fecha específica. Solo administradores pueden crear bloques.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({ organizationId: z.string().uuid().describe('ID de la organización') }),
        body: {
            content: {
                'application/json': {
                    schema: CreateBloqueSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Bloque creado exitosamente',
            content: {
                'application/json': {
                    schema: BloqueResponseSchema,
                    examples: {
                        template: {
                            summary: 'Plantilla de bloque (sin fecha)',
                            value: {
                                success: true,
                                data: {
                                    id: '11111111-2222-3333-4444-555555555555',
                                    organizationId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
                                    actividadId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                                    date: null,
                                    startTime: '09:00:00',
                                    endTime: '11:00:00',
                                    capacity: 10,
                                    isTemplate: true,
                                    createdAt: '2026-02-03T10:00:00.000Z',
                                    updatedAt: '2026-02-03T10:00:00.000Z',
                                },
                                message: 'Plantilla de bloque creada',
                                timestamp: '2026-02-03T10:00:00.000Z',
                            },
                        },
                        dated: {
                            summary: 'Bloque con fecha específica',
                            value: {
                                success: true,
                                data: {
                                    id: '22222222-3333-4444-5555-666666666666',
                                    organizationId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
                                    actividadId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
                                    date: '2026-03-01',
                                    startTime: '08:00:00',
                                    endTime: '10:00:00',
                                    capacity: 8,
                                    isTemplate: false,
                                    createdAt: '2026-02-03T10:05:00.000Z',
                                    updatedAt: '2026-02-03T10:05:00.000Z',
                                },
                                message: 'Bloque creado exitosamente',
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
// POST crear bloque desde plantilla
registry.registerPath({
    method: 'post',
    path: '/api/v1/organizations/{organizationId}/bloques/from-template',
    tags: ['Bloques'],
    summary: 'Crear bloque desde plantilla',
    description: 'Crear un bloque a partir de una plantilla existente para una fecha específica.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({ organizationId: z.string().uuid().describe('ID de la organización') }),
        body: {
            content: {
                'application/json': {
                    schema: CreateBloqueFromTemplateSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Bloque creado desde plantilla',
            content: {
                'application/json': {
                    schema: BloqueResponseSchema,
                },
            },
        },
        400: commonErrorResponses[400],
        401: commonErrorResponses[401],
        403: commonErrorResponses[403],
        500: commonErrorResponses[500],
    },
});
// GET listar bloques
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations/{organizationId}/bloques',
    tags: ['Bloques'],
    summary: 'Listar bloques',
    description: 'Lista bloques de la organización con paginación y filtros (actividad, fecha, plantilla).',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({ organizationId: z.string().uuid().describe('ID de la organización') }),
        query: ListBloquesSchema,
    },
    responses: {
        200: {
            description: 'Bloques obtenidos exitosamente',
            content: {
                'application/json': {
                    schema: BloqueListResponseSchema,
                },
            },
        },
        401: commonErrorResponses[401],
        403: commonErrorResponses[403],
        500: commonErrorResponses[500],
    },
});
// GET obtener bloque por ID
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations/{organizationId}/bloques/{bloqueId}',
    tags: ['Bloques'],
    summary: 'Obtener bloque por ID',
    description: 'Obtiene los detalles de un bloque específico por su ID.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
            bloqueId: z.string().uuid().describe('ID del bloque'),
        }),
    },
    responses: {
        200: {
            description: 'Bloque obtenido exitosamente',
            content: {
                'application/json': {
                    schema: BloqueResponseSchema,
                },
            },
        },
        401: commonErrorResponses[401],
        403: commonErrorResponses[403],
        404: commonErrorResponses[404],
        500: commonErrorResponses[500],
    },
});
// PATCH actualizar bloque
registry.registerPath({
    method: 'patch',
    path: '/api/v1/organizations/{organizationId}/bloques/{bloqueId}',
    tags: ['Bloques'],
    summary: 'Actualizar bloque',
    description: 'Actualiza un bloque existente. Al menos un campo es requerido.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
            bloqueId: z.string().uuid().describe('ID del bloque a actualizar'),
        }),
        body: {
            content: {
                'application/json': {
                    schema: UpdateBloqueSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Bloque actualizado exitosamente',
            content: {
                'application/json': {
                    schema: BloqueResponseSchema,
                },
            },
        },
        400: commonErrorResponses[400],
        401: commonErrorResponses[401],
        403: commonErrorResponses[403],
        404: commonErrorResponses[404],
        500: commonErrorResponses[500],
    },
});
// DELETE eliminar bloque (soft delete)
registry.registerPath({
    method: 'delete',
    path: '/api/v1/organizations/{organizationId}/bloques/{bloqueId}',
    tags: ['Bloques'],
    summary: 'Eliminar bloque',
    description: 'Elimina un bloque (soft delete). Solo administradores pueden eliminar bloques.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
            bloqueId: z.string().uuid().describe('ID del bloque a eliminar'),
        }),
    },
    responses: {
        204: {
            description: 'Bloque eliminado exitosamente (sin contenido en respuesta)',
        },
        401: commonErrorResponses[401],
        403: commonErrorResponses[403],
        404: commonErrorResponses[404],
        500: commonErrorResponses[500],
    },
});
//# sourceMappingURL=bloque.swagger.js.map