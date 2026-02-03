import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry, commonErrorResponses } from '../../../shared/swagger/index.js';
import { CreateOrganizationSchema, UpdateOrganizationSchema, ListOrganizationsSchema, } from '../validators/organization.validator.js';
// Extender Zod con funcionalidad OpenAPI
extendZodWithOpenApi(z);
/**
 * Schema de organización en respuestas
 */
const OrganizationSchema = registry.register('Organization', z.object({
    id: z.string().uuid().describe('ID único de la organización'),
    name: z.string().describe('Nombre de la organización (ANP)'),
    ecosystem_type: z
        .enum(['terrestre', 'maritimo', 'mixto'])
        .describe('Tipo de ecosistema: terrestre, marítimo o mixto'),
    settings: z.record(z.string(), z.unknown()).describe('Configuraciones personalizadas (JSONB)'),
    createdAt: z.string().datetime().describe('Fecha de creación'),
    updatedAt: z.string().datetime().describe('Fecha de última actualización'),
}));
/**
 * Schema de respuesta de organización
 */
const OrganizationResponseSchema = registry.register('OrganizationResponse', z.object({
    success: z.literal(true).describe('Indica que la operación fue exitosa'),
    data: OrganizationSchema.describe('Datos de la organización'),
    message: z.string().optional().describe('Mensaje descriptivo opcional'),
    timestamp: z.string().datetime().optional().describe('Marca de tiempo de la respuesta'),
}));
/**
 * Schema de respuesta paginada de organizaciones
 */
const OrganizationListResponseSchema = registry.register('OrganizationListResponse', z.object({
    success: z.literal(true).describe('Indica que la operación fue exitosa'),
    data: z.array(OrganizationSchema).describe('Lista de organizaciones'),
    pagination: z.object({
        page: z.number().describe('Página actual'),
        limit: z.number().describe('Elementos por página'),
        total: z.number().describe('Total de elementos'),
        totalPages: z.number().describe('Total de páginas'),
    }),
    message: z.string().optional().describe('Mensaje descriptivo opcional'),
    timestamp: z.string().datetime().optional().describe('Marca de tiempo de la respuesta'),
}));
/**
 * Registrar rutas de organizaciones en OpenAPI
 */
// POST /api/v1/organizations
registry.registerPath({
    method: 'post',
    path: '/api/v1/organizations',
    tags: ['Organizaciones'],
    summary: 'Crear nueva organización',
    description: 'Crea una nueva organización (ANP - Área Natural Protegida). No requiere autenticación para permitir el registro inicial.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: CreateOrganizationSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Organización creada exitosamente',
            content: {
                'application/json': {
                    schema: OrganizationResponseSchema,
                    examples: {
                        success: {
                            summary: 'Organización creada',
                            value: {
                                success: true,
                                data: {
                                    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                                    name: 'Reserva de la Biosfera Los Tuxtlas',
                                    ecosystem_type: 'mixto',
                                    settings: {
                                        capacidadMaxima: 500,
                                        horaApertura: '08:00',
                                        horaCierre: '18:00',
                                    },
                                    createdAt: '2026-02-03T10:00:00.000Z',
                                    updatedAt: '2026-02-03T10:00:00.000Z',
                                },
                                message: 'Organización creada exitosamente',
                                timestamp: '2026-02-03T10:00:00.000Z',
                            },
                        },
                    },
                },
            },
        },
        400: commonErrorResponses[400],
        500: commonErrorResponses[500],
    },
});
// GET /api/v1/organizations
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations',
    tags: ['Organizaciones'],
    summary: 'Listar organizaciones',
    description: 'Obtiene la lista de organizaciones a las que el usuario tiene acceso. Soporta paginación, ordenamiento y filtros.',
    security: [{ bearerAuth: [] }],
    request: {
        query: ListOrganizationsSchema,
    },
    responses: {
        200: {
            description: 'Lista de organizaciones obtenida exitosamente',
            content: {
                'application/json': {
                    schema: OrganizationListResponseSchema,
                    examples: {
                        success: {
                            summary: 'Lista con paginación',
                            value: {
                                success: true,
                                data: [
                                    {
                                        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                                        name: 'Reserva de la Biosfera Los Tuxtlas',
                                        ecosystem_type: 'mixto',
                                        settings: {
                                            capacidadMaxima: 500,
                                        },
                                        createdAt: '2026-02-01T10:00:00.000Z',
                                        updatedAt: '2026-02-01T10:00:00.000Z',
                                    },
                                    {
                                        id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
                                        name: 'Parque Nacional Arrecifes de Cozumel',
                                        ecosystem_type: 'maritimo',
                                        settings: {},
                                        createdAt: '2026-01-15T12:00:00.000Z',
                                        updatedAt: '2026-01-15T12:00:00.000Z',
                                    },
                                ],
                                pagination: {
                                    page: 1,
                                    limit: 20,
                                    total: 2,
                                    totalPages: 1,
                                },
                                message: 'Organizaciones obtenidas exitosamente',
                                timestamp: '2026-02-03T10:00:00.000Z',
                            },
                        },
                    },
                },
            },
        },
        401: commonErrorResponses[401],
        500: commonErrorResponses[500],
    },
});
// GET /api/v1/organizations/:organizationId
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations/{organizationId}',
    tags: ['Organizaciones'],
    summary: 'Obtener organización por ID',
    description: 'Obtiene los detalles completos de una organización específica. El usuario debe tener acceso a la organización.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
        }),
    },
    responses: {
        200: {
            description: 'Organización obtenida exitosamente',
            content: {
                'application/json': {
                    schema: OrganizationResponseSchema,
                    examples: {
                        success: {
                            summary: 'Organización obtenida',
                            value: {
                                success: true,
                                data: {
                                    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                                    name: 'Reserva de la Biosfera Los Tuxtlas',
                                    ecosystem_type: 'mixto',
                                    settings: {
                                        capacidadMaxima: 500,
                                        horaApertura: '08:00',
                                        horaCierre: '18:00',
                                    },
                                    createdAt: '2026-02-01T10:00:00.000Z',
                                    updatedAt: '2026-02-01T10:00:00.000Z',
                                },
                                message: 'Organización obtenida exitosamente',
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
// PATCH /api/v1/organizations/:organizationId
registry.registerPath({
    method: 'patch',
    path: '/api/v1/organizations/{organizationId}',
    tags: ['Organizaciones'],
    summary: 'Actualizar organización',
    description: 'Actualiza los datos de una organización. Solo usuarios con rol admin pueden actualizar organizaciones. Al menos un campo es requerido.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
        }),
        body: {
            content: {
                'application/json': {
                    schema: UpdateOrganizationSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Organización actualizada exitosamente',
            content: {
                'application/json': {
                    schema: OrganizationResponseSchema,
                    examples: {
                        success: {
                            summary: 'Organización actualizada',
                            value: {
                                success: true,
                                data: {
                                    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                                    name: 'Reserva de la Biosfera Los Tuxtlas - Actualizado',
                                    ecosystem_type: 'mixto',
                                    settings: {
                                        capacidadMaxima: 600,
                                        horaApertura: '08:00',
                                        horaCierre: '18:00',
                                    },
                                    createdAt: '2026-02-01T10:00:00.000Z',
                                    updatedAt: '2026-02-03T14:30:00.000Z',
                                },
                                message: 'Organización actualizada exitosamente',
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
// DELETE /api/v1/organizations/:organizationId
registry.registerPath({
    method: 'delete',
    path: '/api/v1/organizations/{organizationId}',
    tags: ['Organizaciones'],
    summary: 'Eliminar organización',
    description: 'Elimina una organización (soft delete). Solo usuarios con rol admin pueden eliminar organizaciones. La organización se marca como eliminada pero no se borra de la base de datos.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
        }),
    },
    responses: {
        204: {
            description: 'Organización eliminada exitosamente (sin contenido en respuesta)',
        },
        401: commonErrorResponses[401],
        403: commonErrorResponses[403],
        404: commonErrorResponses[404],
        500: commonErrorResponses[500],
    },
});
//# sourceMappingURL=organization.swagger.js.map