import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry, commonErrorResponses } from '../../../shared/swagger/index.js';
import { CreatePrestadorProfileSchema, UpdatePrestadorProfileSchema, ListPrestadoresSchema, } from '../validators/prestador-profile.validator.js';
// Extender Zod con funcionalidad OpenAPI
extendZodWithOpenApi(z);
// Schema de Prestador en respuestas
const PrestadorProfileSchema = registry.register('PrestadorProfile', z.object({
    id: z.string().uuid().describe('ID único del perfil del prestador'),
    userId: z.string().uuid().describe('ID del usuario asociado'),
    organizationId: z.string().uuid().describe('ID de la organización (ANP)'),
    status: z.enum(['activo', 'inactivo', 'suspendido']).describe('Estado del prestador'),
    permitExpiresAt: z.string().datetime().optional().describe('Fecha de expiración del permiso'),
    createdAt: z.string().datetime().describe('Fecha de creación'),
    updatedAt: z.string().datetime().describe('Fecha de última actualización'),
}));
const PrestadorResponseSchema = registry.register('PrestadorResponse', z.object({
    success: z.literal(true),
    data: PrestadorProfileSchema,
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
}));
const PrestadorListResponseSchema = registry.register('PrestadorListResponse', z.object({
    success: z.literal(true),
    data: z.array(PrestadorProfileSchema),
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
}));
// POST crear prestador
registry.registerPath({
    method: 'post',
    path: '/api/v1/organizations/{organizationId}/prestadores',
    tags: ['Prestadores'],
    summary: 'Crear perfil de prestador',
    description: 'Crea el perfil de un prestador asociado a un usuario y organización.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
        }),
        body: {
            content: {
                'application/json': {
                    schema: CreatePrestadorProfileSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Prestador creado exitosamente',
            content: {
                'application/json': {
                    schema: PrestadorResponseSchema,
                    examples: {
                        created: {
                            summary: 'Prestador creado',
                            value: {
                                success: true,
                                data: {
                                    id: 'p1d2e3f4-5678-9012-abcd-ef1234567890',
                                    userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                                    organizationId: 'b1c2d3e4-f5a6-7890-abcd-1234567890ab',
                                    status: 'activo',
                                    permitExpiresAt: '2026-12-31T23:59:59Z',
                                    createdAt: '2026-02-03T12:00:00.000Z',
                                    updatedAt: '2026-02-03T12:00:00.000Z',
                                },
                                message: 'Prestador creado exitosamente',
                                timestamp: '2026-02-03T12:00:00.000Z',
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
// GET listar prestadores
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations/{organizationId}/prestadores',
    tags: ['Prestadores'],
    summary: 'Listar prestadores',
    description: 'Obtiene la lista de prestadores de una organización con paginación y filtros.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
        }),
        query: ListPrestadoresSchema,
    },
    responses: {
        200: {
            description: 'Lista de prestadores obtenida exitosamente',
            content: {
                'application/json': {
                    schema: PrestadorListResponseSchema,
                    examples: {
                        sample: {
                            summary: 'Lista de prestadores',
                            value: {
                                success: true,
                                data: [
                                    {
                                        id: 'p1d2e3f4-5678-9012-abcd-ef1234567890',
                                        userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                                        organizationId: 'b1c2d3e4-f5a6-7890-abcd-1234567890ab',
                                        status: 'activo',
                                        permitExpiresAt: '2026-12-31T23:59:59Z',
                                        createdAt: '2026-02-03T12:00:00.000Z',
                                        updatedAt: '2026-02-03T12:00:00.000Z',
                                    },
                                ],
                                message: 'Prestadores obtenidos exitosamente',
                                timestamp: '2026-02-03T12:00:00.000Z',
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
// GET obtener prestador por id
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations/{organizationId}/prestadores/{prestadorId}',
    tags: ['Prestadores'],
    summary: 'Obtener perfil de prestador',
    description: 'Obtiene un perfil de prestador por su ID.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
            prestadorId: z.string().uuid().describe('ID del prestador'),
        }),
    },
    responses: {
        200: {
            description: 'Prestador obtenido exitosamente',
            content: {
                'application/json': {
                    schema: PrestadorResponseSchema,
                },
            },
        },
        401: commonErrorResponses[401],
        403: commonErrorResponses[403],
        404: commonErrorResponses[404],
        500: commonErrorResponses[500],
    },
});
// PATCH actualizar prestador
registry.registerPath({
    method: 'patch',
    path: '/api/v1/organizations/{organizationId}/prestadores/{prestadorId}',
    tags: ['Prestadores'],
    summary: 'Actualizar perfil de prestador',
    description: 'Actualiza campos del perfil de prestador (status, permitExpiresAt).',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
            prestadorId: z.string().uuid().describe('ID del prestador'),
        }),
        body: {
            content: {
                'application/json': {
                    schema: UpdatePrestadorProfileSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Prestador actualizado exitosamente',
            content: {
                'application/json': {
                    schema: PrestadorResponseSchema,
                    examples: {
                        updated: {
                            summary: 'Prestador actualizado',
                            value: {
                                success: true,
                                data: {
                                    id: 'p1d2e3f4-5678-9012-abcd-ef1234567890',
                                    userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                                    organizationId: 'b1c2d3e4-f5a6-7890-abcd-1234567890ab',
                                    status: 'suspendido',
                                    permitExpiresAt: '2027-01-01T00:00:00Z',
                                    createdAt: '2026-02-03T12:00:00.000Z',
                                    updatedAt: '2026-03-01T09:00:00.000Z',
                                },
                                message: 'Prestador actualizado exitosamente',
                                timestamp: '2026-03-01T09:00:00.000Z',
                            },
                        },
                    },
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
//# sourceMappingURL=prestador.swagger.js.map