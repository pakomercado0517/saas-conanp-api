import { z, registry, commonErrorResponses } from '../../../shared/swagger/index.js';
import { CreateDependenciaSchema, UpdateDependenciaSchema, ListDependenciasSchema, CreateAreaUnderDependenciaSchema, } from '../validators/dependencia.validator.js';
const DependenciaSchema = registry.register('Dependencia', z.object({
    id: z.string().uuid().describe('ID único de la dependencia'),
    name: z.string().describe('Nombre de la dependencia'),
    settings: z.record(z.string(), z.unknown()).describe('Configuraciones (JSONB)'),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
}));
const DependenciaResponseSchema = registry.register('DependenciaResponse', z.object({
    success: z.literal(true),
    data: DependenciaSchema,
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
}));
const DependenciaListResponseSchema = registry.register('DependenciaListResponse', z.object({
    success: z.literal(true),
    data: z.array(DependenciaSchema),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
    }),
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
}));
const AreaSchema = registry.register('AreaUnderDependencia', z.object({
    id: z.string().uuid(),
    dependenciaId: z.string().uuid(),
    name: z.string(),
    ecosystem_type: z.enum(['terrestre', 'maritimo', 'mixto']),
    settings: z.record(z.string(), z.unknown()),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
}));
const AreaListResponseSchema = registry.register('AreaListResponse', z.object({
    success: z.literal(true),
    data: z.array(AreaSchema),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
    }),
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
}));
// POST /api/v1/dependencias
registry.registerPath({
    method: 'post',
    path: '/api/v1/dependencias',
    tags: ['Dependencias'],
    summary: 'Crear dependencia',
    description: 'Crea una dependencia. El usuario queda como owner (DependenciaMembership). Se crea suscripción FREE. No crea área; usar POST /dependencias/:dependenciaId/areas para crear áreas. Plan FREE: 1 dependencia por usuario.',
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: CreateDependenciaSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Dependencia creada',
            content: {
                'application/json': {
                    schema: DependenciaResponseSchema,
                },
            },
        },
        400: commonErrorResponses[400],
        401: commonErrorResponses[401],
        500: commonErrorResponses[500],
    },
});
// GET /api/v1/dependencias
registry.registerPath({
    method: 'get',
    path: '/api/v1/dependencias',
    tags: ['Dependencias'],
    summary: 'Listar dependencias',
    description: 'Lista dependencias a las que el usuario tiene acceso (por DependenciaMembership o por área).',
    security: [{ bearerAuth: [] }],
    request: {
        query: ListDependenciasSchema,
    },
    responses: {
        200: {
            description: 'Lista de dependencias',
            content: {
                'application/json': {
                    schema: DependenciaListResponseSchema,
                },
            },
        },
        401: commonErrorResponses[401],
        500: commonErrorResponses[500],
    },
});
// GET /api/v1/dependencias/:dependenciaId
registry.registerPath({
    method: 'get',
    path: '/api/v1/dependencias/{dependenciaId}',
    tags: ['Dependencias'],
    summary: 'Obtener dependencia por ID',
    description: 'Detalle de una dependencia. Requiere acceso (DependenciaMembership o membresía en alguna área).',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            dependenciaId: z.string().uuid().describe('ID de la dependencia'),
        }),
    },
    responses: {
        200: {
            description: 'Dependencia obtenida',
            content: {
                'application/json': {
                    schema: DependenciaResponseSchema,
                },
            },
        },
        401: commonErrorResponses[401],
        403: commonErrorResponses[403],
        404: commonErrorResponses[404],
        500: commonErrorResponses[500],
    },
});
// PATCH /api/v1/dependencias/:dependenciaId
registry.registerPath({
    method: 'patch',
    path: '/api/v1/dependencias/{dependenciaId}',
    tags: ['Dependencias'],
    summary: 'Actualizar dependencia',
    description: 'Actualiza nombre o settings. Requiere acceso.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            dependenciaId: z.string().uuid(),
        }),
        body: {
            content: {
                'application/json': {
                    schema: UpdateDependenciaSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Dependencia actualizada',
            content: {
                'application/json': {
                    schema: DependenciaResponseSchema,
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
// DELETE /api/v1/dependencias/:dependenciaId
registry.registerPath({
    method: 'delete',
    path: '/api/v1/dependencias/{dependenciaId}',
    tags: ['Dependencias'],
    summary: 'Eliminar dependencia',
    description: 'Elimina (soft delete) la dependencia. Requiere acceso.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            dependenciaId: z.string().uuid(),
        }),
    },
    responses: {
        204: { description: 'Dependencia eliminada' },
        401: commonErrorResponses[401],
        403: commonErrorResponses[403],
        404: commonErrorResponses[404],
        500: commonErrorResponses[500],
    },
});
// POST /api/v1/dependencias/:dependenciaId/areas
registry.registerPath({
    method: 'post',
    path: '/api/v1/dependencias/{dependenciaId}/areas',
    tags: ['Dependencias'],
    summary: 'Crear área bajo dependencia',
    description: 'Crea un área (ANP) dentro de la dependencia. Plan FREE: 1 área por dependencia. Requiere acceso a la dependencia.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            dependenciaId: z.string().uuid(),
        }),
        body: {
            content: {
                'application/json': {
                    schema: CreateAreaUnderDependenciaSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Área creada',
            content: {
                'application/json': {
                    schema: z.object({
                        success: z.literal(true),
                        data: AreaSchema,
                        message: z.string().optional(),
                        timestamp: z.string().datetime().optional(),
                    }),
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
// GET /api/v1/dependencias/:dependenciaId/areas
registry.registerPath({
    method: 'get',
    path: '/api/v1/dependencias/{dependenciaId}/areas',
    tags: ['Dependencias'],
    summary: 'Listar áreas de la dependencia',
    description: 'Lista áreas (ANPs) de la dependencia. Requiere acceso. Acepta paginación (query: page, limit).',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            dependenciaId: z.string().uuid().describe('ID de la dependencia'),
        }),
    },
    responses: {
        200: {
            description: 'Lista de áreas',
            content: {
                'application/json': {
                    schema: AreaListResponseSchema,
                },
            },
        },
        401: commonErrorResponses[401],
        403: commonErrorResponses[403],
        404: commonErrorResponses[404],
        500: commonErrorResponses[500],
    },
});
//# sourceMappingURL=dependencia.swagger.js.map