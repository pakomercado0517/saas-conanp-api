import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry, commonErrorResponses } from '../../../shared/swagger/index.js';
import { CreateMembershipSchema, UpdateMembershipSchema, ListMembershipsSchema, } from '../validators/membership.validator.js';
// Extender Zod con funcionalidad OpenAPI
extendZodWithOpenApi(z);
/**
 * Schema de membership en respuestas
 */
const MembershipSchema = registry.register('Membership', z.object({
    id: z.string().uuid().describe('ID único de la membresía'),
    userId: z.string().uuid().describe('ID del usuario'),
    organizationId: z.string().uuid().describe('ID de la organización'),
    role: z
        .enum(['admin', 'gestor', 'prestador', 'observador'])
        .describe('Rol del usuario en la organización'),
    status: z
        .enum(['activo', 'inactivo', 'suspendido'])
        .describe('Estado de la membresía'),
    createdAt: z.string().datetime().describe('Fecha de creación'),
    updatedAt: z.string().datetime().describe('Fecha de última actualización'),
    user: z
        .object({
        id: z.string().uuid(),
        email: z.string().email(),
        firstName: z.string(),
        lastName: z.string(),
    })
        .optional()
        .describe('Datos del usuario (incluido en algunas respuestas)'),
    organization: z
        .object({
        id: z.string().uuid(),
        name: z.string(),
        ecosystem_type: z.enum(['terrestre', 'maritimo', 'mixto']),
    })
        .optional()
        .describe('Datos de la organización (incluido en algunas respuestas)'),
}));
/**
 * Schema de respuesta de membership
 */
const MembershipResponseSchema = registry.register('MembershipResponse', z.object({
    success: z.literal(true).describe('Indica que la operación fue exitosa'),
    data: MembershipSchema.describe('Datos de la membresía'),
    message: z.string().optional().describe('Mensaje descriptivo opcional'),
    timestamp: z.string().datetime().optional().describe('Marca de tiempo de la respuesta'),
}));
/**
 * Schema de respuesta paginada de memberships
 */
const MembershipListResponseSchema = registry.register('MembershipListResponse', z.object({
    success: z.literal(true).describe('Indica que la operación fue exitosa'),
    data: z.array(MembershipSchema).describe('Lista de membresías'),
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
 * Registrar rutas de memberships en OpenAPI
 */
// POST /api/v1/organizations/:organizationId/memberships
registry.registerPath({
    method: 'post',
    path: '/api/v1/organizations/{organizationId}/memberships',
    tags: ['Memberships'],
    summary: 'Invitar usuario a organización',
    description: 'Crea una nueva membresía invitando a un usuario a una organización. Solo administradores pueden invitar usuarios. El usuario debe existir previamente en el sistema.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
        }),
        body: {
            content: {
                'application/json': {
                    schema: CreateMembershipSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Usuario invitado exitosamente a la organización',
            content: {
                'application/json': {
                    schema: MembershipResponseSchema,
                    examples: {
                        success: {
                            summary: 'Invitación exitosa',
                            value: {
                                success: true,
                                data: {
                                    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
                                    userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                                    organizationId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
                                    role: 'prestador',
                                    status: 'activo',
                                    createdAt: '2026-02-03T10:00:00.000Z',
                                    updatedAt: '2026-02-03T10:00:00.000Z',
                                    user: {
                                        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                                        email: 'prestador@example.com',
                                        firstName: 'Juan',
                                        lastName: 'Pérez',
                                    },
                                    organization: {
                                        id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
                                        name: 'Reserva de la Biosfera Los Tuxtlas',
                                        ecosystem_type: 'mixto',
                                    },
                                },
                                message: 'Usuario invitado a organización exitosamente',
                                timestamp: '2026-02-03T10:00:00.000Z',
                            },
                        },
                    },
                },
            },
        },
        400: {
            description: 'Error de validación o usuario ya pertenece a la organización',
            content: {
                'application/json': {
                    schema: z.object({
                        success: z.literal(false),
                        error: z.string(),
                        message: z.string(),
                        code: z.string(),
                    }),
                    examples: {
                        duplicateMembership: {
                            summary: 'Usuario ya es miembro',
                            value: {
                                success: false,
                                error: 'Error de validación',
                                message: 'El usuario ya es miembro de esta organización',
                                code: 'DUPLICATE_MEMBERSHIP',
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
// GET /api/v1/organizations/:organizationId/memberships
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations/{organizationId}/memberships',
    tags: ['Memberships'],
    summary: 'Listar membresías',
    description: 'Obtiene la lista de membresías de una organización con paginación y filtros. Incluye información del usuario y organización en cada membresía.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
        }),
        query: ListMembershipsSchema,
    },
    responses: {
        200: {
            description: 'Lista de membresías obtenida exitosamente',
            content: {
                'application/json': {
                    schema: MembershipListResponseSchema,
                    examples: {
                        success: {
                            summary: 'Lista con paginación',
                            value: {
                                success: true,
                                data: [
                                    {
                                        id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
                                        userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                                        organizationId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
                                        role: 'prestador',
                                        status: 'activo',
                                        createdAt: '2026-02-01T10:00:00.000Z',
                                        updatedAt: '2026-02-01T10:00:00.000Z',
                                        user: {
                                            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                                            email: 'prestador@example.com',
                                            firstName: 'Juan',
                                            lastName: 'Pérez',
                                        },
                                    },
                                    {
                                        id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
                                        userId: 'd4e5f6a7-b890-1234-defg-234567890123',
                                        organizationId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
                                        role: 'admin',
                                        status: 'activo',
                                        createdAt: '2026-01-15T12:00:00.000Z',
                                        updatedAt: '2026-01-15T12:00:00.000Z',
                                        user: {
                                            id: 'd4e5f6a7-b890-1234-defg-234567890123',
                                            email: 'admin@example.com',
                                            firstName: 'María',
                                            lastName: 'González',
                                        },
                                    },
                                ],
                                pagination: {
                                    page: 1,
                                    limit: 20,
                                    total: 2,
                                    totalPages: 1,
                                },
                                message: 'Memberships obtenidas exitosamente',
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
// PATCH /api/v1/organizations/:organizationId/memberships/:membershipId
registry.registerPath({
    method: 'patch',
    path: '/api/v1/organizations/{organizationId}/memberships/{membershipId}',
    tags: ['Memberships'],
    summary: 'Actualizar membresía',
    description: 'Actualiza el rol y/o estado de una membresía existente. Solo administradores pueden actualizar membresías. Al menos un campo es requerido.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
            membershipId: z.string().uuid().describe('ID de la membresía a actualizar'),
        }),
        body: {
            content: {
                'application/json': {
                    schema: UpdateMembershipSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Membresía actualizada exitosamente',
            content: {
                'application/json': {
                    schema: MembershipResponseSchema,
                    examples: {
                        success: {
                            summary: 'Cambio de rol',
                            value: {
                                success: true,
                                data: {
                                    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
                                    userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                                    organizationId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
                                    role: 'gestor',
                                    status: 'activo',
                                    createdAt: '2026-02-01T10:00:00.000Z',
                                    updatedAt: '2026-02-03T14:30:00.000Z',
                                    user: {
                                        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                                        email: 'prestador@example.com',
                                        firstName: 'Juan',
                                        lastName: 'Pérez',
                                    },
                                },
                                message: 'Membership actualizada exitosamente',
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
                                message: 'Debe incluir al menos un campo para actualizar (role o status)',
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
// DELETE /api/v1/organizations/:organizationId/memberships/:membershipId
registry.registerPath({
    method: 'delete',
    path: '/api/v1/organizations/{organizationId}/memberships/{membershipId}',
    tags: ['Memberships'],
    summary: 'Eliminar membresía',
    description: 'Elimina una membresía, removiendo al usuario de la organización. Solo administradores pueden eliminar membresías. La membresía se elimina permanentemente de la base de datos.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
            membershipId: z.string().uuid().describe('ID de la membresía a eliminar'),
        }),
    },
    responses: {
        204: {
            description: 'Membresía eliminada exitosamente (sin contenido en respuesta)',
        },
        401: commonErrorResponses[401],
        403: commonErrorResponses[403],
        404: commonErrorResponses[404],
        500: commonErrorResponses[500],
    },
});
//# sourceMappingURL=membership.swagger.js.map