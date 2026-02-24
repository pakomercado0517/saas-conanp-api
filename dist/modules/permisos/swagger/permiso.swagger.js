import { z, registry, commonErrorResponses } from '@/shared/swagger/index.js';
import { CreatePermisoSchema, UpdatePermisoSchema, ListPermisosSchema, } from '../validators/permiso.validator.js';
const PermisoSchema = registry.register('Permiso', z.object({
    id: z.string().uuid().describe('ID único del permiso'),
    prestadorId: z.string().uuid().describe('ID del prestador'),
    actividadId: z.string().uuid().describe('ID de la actividad'),
    validFrom: z.string().datetime().describe('Fecha/hora de inicio de vigencia'),
    validTo: z.string().datetime().describe('Fecha/hora de fin de vigencia'),
    status: z.enum(['activo', 'inactivo', 'vencido', 'suspendido']).describe('Estado del permiso'),
    documentUrl: z.string().nullable().optional().describe('URL del documento del permiso'),
    organizationId: z.string().uuid().describe('ID de la organización'),
    createdAt: z.string().datetime().describe('Fecha de creación'),
    updatedAt: z.string().datetime().describe('Fecha de última actualización'),
}));
const PermisoResponseSchema = registry.register('PermisoResponse', z.object({
    success: z.literal(true),
    data: PermisoSchema,
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
}));
const PermisoListResponseSchema = registry.register('PermisoListResponse', z.object({
    success: z.literal(true),
    data: z.array(PermisoSchema),
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
}));
// POST crear permiso
registry.registerPath({
    method: 'post',
    path: '/api/v1/organizations/{organizationId}/permisos',
    tags: ['Permisos'],
    summary: 'Crear permiso para un prestador',
    description: 'Crea un permiso que autoriza a un prestador para realizar una actividad durante un periodo.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({ organizationId: z.string().uuid().describe('ID de la organización') }),
        body: {
            content: {
                'application/json': {
                    schema: CreatePermisoSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Permiso creado exitosamente',
            content: {
                'application/json': {
                    schema: PermisoResponseSchema,
                    examples: {
                        created: {
                            summary: 'Permiso creado',
                            value: {
                                success: true,
                                data: {
                                    id: 'perm1-2345-6789-abcd-ef1234567890',
                                    prestadorId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                                    actividadId: 'b1c2d3e4-f5a6-7890-abcd-1234567890ab',
                                    validFrom: '2026-03-01T00:00:00Z',
                                    validTo: '2026-12-31T23:59:59Z',
                                    status: 'activo',
                                    documentUrl: 'https://example.com/doc.pdf',
                                    organizationId: 'org-1234-5678-90ab-cdef',
                                    createdAt: '2026-02-03T12:00:00.000Z',
                                    updatedAt: '2026-02-03T12:00:00.000Z',
                                },
                                message: 'Permiso creado exitosamente',
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
// GET listar permisos
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations/{organizationId}/permisos',
    tags: ['Permisos'],
    summary: 'Listar permisos',
    description: 'Obtiene permisos de la organización con filtros y paginación.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({ organizationId: z.string().uuid().describe('ID de la organización') }),
        query: ListPermisosSchema,
    },
    responses: {
        200: {
            description: 'Permisos obtenidos correctamente',
            content: {
                'application/json': {
                    schema: PermisoListResponseSchema,
                },
            },
        },
        401: commonErrorResponses[401],
        403: commonErrorResponses[403],
        500: commonErrorResponses[500],
    },
});
// GET obtener permiso por id
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations/{organizationId}/permisos/{permisoId}',
    tags: ['Permisos'],
    summary: 'Obtener permiso por ID',
    description: 'Obtiene un permiso por su ID dentro de la organización.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
            permisoId: z.string().uuid().describe('ID del permiso'),
        }),
    },
    responses: {
        200: {
            description: 'Permiso obtenido exitosamente',
            content: {
                'application/json': {
                    schema: PermisoResponseSchema,
                },
            },
        },
        401: commonErrorResponses[401],
        403: commonErrorResponses[403],
        404: commonErrorResponses[404],
        500: commonErrorResponses[500],
    },
});
// PATCH actualizar permiso
registry.registerPath({
    method: 'patch',
    path: '/api/v1/organizations/{organizationId}/permisos/{permisoId}',
    tags: ['Permisos'],
    summary: 'Actualizar permiso',
    description: 'Actualiza campos de un permiso existente.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
            permisoId: z.string().uuid().describe('ID del permiso'),
        }),
        body: {
            content: {
                'application/json': {
                    schema: UpdatePermisoSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Permiso actualizado exitosamente',
            content: {
                'application/json': {
                    schema: PermisoResponseSchema,
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
export {};
//# sourceMappingURL=permiso.swagger.js.map