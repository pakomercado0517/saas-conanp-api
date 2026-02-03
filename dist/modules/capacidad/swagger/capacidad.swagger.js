import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry, commonErrorResponses } from '../../../shared/swagger/index.js';
import { CreateCapacidadSchema, VerificarDisponibilidadSchema, } from '../validators/capacidad.validator.js';
// Extender Zod con funcionalidad OpenAPI
extendZodWithOpenApi(z);
/**
 * Schema de capacidad en respuestas
 */
const CapacidadSchema = registry.register('Capacidad', z.object({
    id: z.string().uuid().describe('ID único de la capacidad'),
    actividadId: z.string().uuid().describe('ID de la actividad'),
    date: z.string().describe('Fecha (YYYY-MM-DD)'),
    limit: z.number().describe('Límite máximo de personas'),
    used: z.number().describe('Cantidad ya usada (si aplica)'),
    organizationId: z.string().uuid().describe('ID de la organización (ANP)'),
    createdAt: z.string().datetime().describe('Fecha de creación'),
    updatedAt: z.string().datetime().describe('Fecha de última actualización'),
}));
const CapacidadResponseSchema = registry.register('CapacidadResponse', z.object({
    success: z.literal(true),
    data: CapacidadSchema,
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
}));
const CapacidadListResponseSchema = registry.register('CapacidadListResponse', z.object({
    success: z.literal(true),
    data: z.array(CapacidadSchema),
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
}));
// POST crear o actualizar capacidad
registry.registerPath({
    method: 'post',
    path: '/api/v1/organizations/{organizationId}/actividades/{actividadId}/capacidad',
    tags: ['Capacidad'],
    summary: 'Crear o actualizar capacidad para una actividad y fecha',
    description: 'Crea una capacidad para una actividad en una fecha determinada. Si ya existe una capacidad para esa fecha, se actualiza. Solo administradores pueden crear/actualizar capacidades.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
            actividadId: z.string().uuid().describe('ID de la actividad'),
        }),
        body: {
            content: {
                'application/json': {
                    schema: CreateCapacidadSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Capacidad creada exitosamente',
            content: {
                'application/json': {
                    schema: CapacidadResponseSchema,
                    examples: {
                        created: {
                            summary: 'Capacidad creada',
                            value: {
                                success: true,
                                data: {
                                    id: 'c1d2e3f4-5678-9012-abcd-ef1234567890',
                                    actividadId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                                    date: '2026-03-15',
                                    limit: 20,
                                    used: 0,
                                    organizationId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
                                    createdAt: '2026-02-03T12:00:00.000Z',
                                    updatedAt: '2026-02-03T12:00:00.000Z',
                                },
                                message: 'Capacidad creada exitosamente',
                                timestamp: '2026-02-03T12:00:00.000Z',
                            },
                        },
                    },
                },
            },
        },
        200: {
            description: 'Capacidad actualizada exitosamente',
            content: {
                'application/json': {
                    schema: CapacidadResponseSchema,
                },
            },
        },
        400: commonErrorResponses[400],
        401: commonErrorResponses[401],
        403: commonErrorResponses[403],
        500: commonErrorResponses[500],
    },
});
// GET listar capacidades para una actividad
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations/{organizationId}/actividades/{actividadId}/capacidad',
    tags: ['Capacidad'],
    summary: 'Listar capacidades de una actividad',
    description: 'Obtiene las capacidades configuradas para una actividad (por fecha).',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
            actividadId: z.string().uuid().describe('ID de la actividad'),
        }),
    },
    responses: {
        200: {
            description: 'Lista de capacidades obtenida exitosamente',
            content: {
                'application/json': {
                    schema: CapacidadListResponseSchema,
                    examples: {
                        success: {
                            summary: 'Lista de capacidades',
                            value: {
                                success: true,
                                data: [
                                    {
                                        id: 'c1d2e3f4-5678-9012-abcd-ef1234567890',
                                        actividadId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                                        date: '2026-03-15',
                                        limit: 20,
                                        used: 5,
                                        organizationId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
                                        createdAt: '2026-02-03T12:00:00.000Z',
                                        updatedAt: '2026-02-03T12:00:00.000Z',
                                    },
                                ],
                                message: 'Capacidades obtenidas exitosamente',
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
// GET verificar disponibilidad (por query params)
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations/{organizationId}/actividades/{actividadId}/capacidad/verificar',
    tags: ['Capacidad'],
    summary: 'Verificar disponibilidad de capacidad',
    description: 'Verifica si hay disponibilidad para una actividad en una fecha o en un bloque específico. Para actividades con agenda BLOQUES, incluir `bloqueId` en query.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
            actividadId: z.string().uuid().describe('ID de la actividad'),
        }),
        // Usamos el schema de VerificarDisponibilidad omitiendo actividadId para los query params
        query: VerificarDisponibilidadSchema.omit({ actividadId: true }),
    },
    responses: {
        200: {
            description: 'Disponibilidad verificada',
            content: {
                'application/json': {
                    schema: z.object({
                        success: z.literal(true),
                        data: z.object({
                            disponible: z.boolean(),
                            capacidadTotal: z.number(),
                            capacidadUsada: z.number(),
                            capacidadDisponible: z.number(),
                            limite: z.number(),
                        }),
                        message: z.string().optional(),
                        timestamp: z.string().datetime().optional(),
                    }),
                    examples: {
                        disponible: {
                            summary: 'Capacidad disponible',
                            value: {
                                success: true,
                                data: {
                                    disponible: true,
                                    capacidadTotal: 20,
                                    capacidadUsada: 5,
                                    capacidadDisponible: 15,
                                    limite: 20,
                                },
                                message: 'Disponibilidad verificada exitosamente',
                                timestamp: '2026-02-03T12:00:00.000Z',
                            },
                        },
                        noDisponible: {
                            summary: 'Capacidad no disponible',
                            value: {
                                success: true,
                                data: {
                                    disponible: false,
                                    capacidadTotal: 10,
                                    capacidadUsada: 10,
                                    capacidadDisponible: 0,
                                    limite: 10,
                                },
                                message: 'No hay capacidad disponible',
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
        404: commonErrorResponses[404],
        500: commonErrorResponses[500],
    },
});
//# sourceMappingURL=capacidad.swagger.js.map