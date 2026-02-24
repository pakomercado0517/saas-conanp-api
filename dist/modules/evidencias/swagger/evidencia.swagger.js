import { z, registry, commonErrorResponses } from '@/shared/swagger/index.js';
// Schema de respuesta para Evidencia Ambiental
const EvidenciaAmbientalSchema = registry.register('EvidenciaAmbiental', z.object({
    id: z.string().uuid().describe('ID único de la evidencia ambiental'),
    eventoId: z.string().uuid().describe('ID del evento operativo asociado'),
    type: z.string().describe('Tipo de evidencia (ej: Fotografía, Video, Documento)'),
    description: z.string().nullable().describe('Descripción opcional de la evidencia'),
    fileUrl: z
        .string()
        .url()
        .nullable()
        .describe('URL del archivo almacenado en el servicio de archivos'),
    createdAt: z.string().datetime().describe('Fecha de creación'),
    updatedAt: z.string().datetime().describe('Fecha de última actualización'),
    EventoOperativo: z
        .object({
        id: z.string().uuid(),
        actividadId: z.string().uuid(),
        date: z.string().datetime(),
        status: z.enum(['programado', 'en_progreso', 'completado', 'cancelado']),
    })
        .optional()
        .describe('Información del evento operativo asociado'),
}));
// Schema de respuesta exitosa para una evidencia
const EvidenciaResponseSchema = registry.register('EvidenciaResponse', z.object({
    success: z.literal(true),
    data: EvidenciaAmbientalSchema,
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
}));
// Schema de respuesta para lista de evidencias con paginación
const EvidenciaListResponseSchema = registry.register('EvidenciaListResponse', z.object({
    success: z.literal(true),
    data: z.array(EvidenciaAmbientalSchema),
    pagination: z.object({
        page: z.number().int().positive(),
        limit: z.number().int().positive(),
        total: z.number().int().min(0),
        totalPages: z.number().int().min(0),
    }),
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
}));
// Schema de respuesta para creación exitosa
const EvidenciaCreatedResponseSchema = registry.register('EvidenciaCreatedResponse', z.object({
    success: z.literal(true),
    data: EvidenciaAmbientalSchema,
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
}));
// Schema de respuesta para actualización exitosa
const EvidenciaUpdatedResponseSchema = registry.register('EvidenciaUpdatedResponse', z.object({
    success: z.literal(true),
    data: EvidenciaAmbientalSchema,
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
}));
// Documentación de endpoints
// POST /api/v1/organizations/{organizationId}/eventos/{eventoId}/evidencias
registry.registerPath({
    method: 'post',
    path: '/api/v1/organizations/{organizationId}/eventos/{eventoId}/evidencias',
    summary: 'Crear evidencia ambiental',
    description: 'Crea una nueva evidencia ambiental asociada a un evento operativo. Puede incluir un archivo subido o una URL de archivo existente.',
    tags: ['Evidencias Ambientales'],
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización (ANP)'),
            eventoId: z.string().uuid().describe('ID del evento operativo'),
        }),
        body: {
            content: {
                'multipart/form-data': {
                    schema: z.object({
                        type: z.string().describe('Tipo de evidencia (ej: Fotografía, Video, Documento)'),
                        description: z.string().optional().describe('Descripción opcional de la evidencia'),
                        fileUrl: z.string().url().optional().describe('URL del archivo si ya está subido'),
                        file: z.any().optional().describe('Archivo a subir (multipart/form-data)'),
                    }),
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Evidencia creada exitosamente',
            content: {
                'application/json': {
                    schema: EvidenciaCreatedResponseSchema,
                    example: {
                        success: true,
                        data: {
                            id: '123e4567-e89b-12d3-a456-426614174000',
                            eventoId: '123e4567-e89b-12d3-a456-426614174001',
                            type: 'Fotografía de impacto ambiental',
                            description: 'Fotografía tomada durante la actividad de snorkel',
                            fileUrl: 'https://storage.example.com/evidencias/foto-123.jpg',
                            createdAt: '2024-01-15T10:30:00Z',
                            updatedAt: '2024-01-15T10:30:00Z',
                            EventoOperativo: {
                                id: '123e4567-e89b-12d3-a456-426614174001',
                                actividadId: '123e4567-e89b-12d3-a456-426614174002',
                                date: '2024-01-15T09:00:00Z',
                                status: 'completado',
                            },
                        },
                        message: 'Evidencia creada exitosamente',
                        timestamp: '2024-01-15T10:30:00Z',
                    },
                },
            },
        },
        ...commonErrorResponses,
    },
});
// GET /api/v1/organizations/{organizationId}/eventos/{eventoId}/evidencias
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations/{organizationId}/eventos/{eventoId}/evidencias',
    summary: 'Listar evidencias ambientales',
    description: 'Obtiene una lista paginada de evidencias ambientales asociadas a un evento operativo, con opciones de filtrado y ordenamiento.',
    tags: ['Evidencias Ambientales'],
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización (ANP)'),
            eventoId: z.string().uuid().describe('ID del evento operativo'),
        }),
        query: z.object({
            page: z.coerce.number().int().positive().default(1).describe('Número de página'),
            limit: z.coerce
                .number()
                .int()
                .positive()
                .max(100)
                .default(20)
                .describe('Elementos por página'),
            sortBy: z.enum(['type', 'createdAt', 'updatedAt']).optional().describe('Campo para ordenar'),
            sortOrder: z.enum(['asc', 'desc']).default('desc').describe('Dirección del ordenamiento'),
            type: z.string().optional().describe('Filtro por tipo de evidencia'),
        }),
    },
    responses: {
        200: {
            description: 'Lista de evidencias obtenida exitosamente',
            content: {
                'application/json': {
                    schema: EvidenciaListResponseSchema,
                    example: {
                        success: true,
                        data: [
                            {
                                id: '123e4567-e89b-12d3-a456-426614174000',
                                eventoId: '123e4567-e89b-12d3-a456-426614174001',
                                type: 'Fotografía de impacto ambiental',
                                description: 'Fotografía tomada durante la actividad de snorkel',
                                fileUrl: 'https://storage.example.com/evidencias/foto-123.jpg',
                                createdAt: '2024-01-15T10:30:00Z',
                                updatedAt: '2024-01-15T10:30:00Z',
                                EventoOperativo: {
                                    id: '123e4567-e89b-12d3-a456-426614174001',
                                    actividadId: '123e4567-e89b-12d3-a456-426614174002',
                                    date: '2024-01-15T09:00:00Z',
                                    status: 'completado',
                                },
                            },
                        ],
                        pagination: {
                            page: 1,
                            limit: 20,
                            total: 1,
                            totalPages: 1,
                        },
                        message: 'Evidencias obtenidas exitosamente',
                        timestamp: '2024-01-15T10:30:00Z',
                    },
                },
            },
        },
        ...commonErrorResponses,
    },
});
// GET /api/v1/organizations/{organizationId}/eventos/{eventoId}/evidencias/{evidenciaId}
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations/{organizationId}/eventos/{eventoId}/evidencias/{evidenciaId}',
    summary: 'Obtener evidencia ambiental por ID',
    description: 'Obtiene los detalles de una evidencia ambiental específica por su ID.',
    tags: ['Evidencias Ambientales'],
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización (ANP)'),
            eventoId: z.string().uuid().describe('ID del evento operativo'),
            evidenciaId: z.string().uuid().describe('ID de la evidencia ambiental'),
        }),
    },
    responses: {
        200: {
            description: 'Evidencia obtenida exitosamente',
            content: {
                'application/json': {
                    schema: EvidenciaResponseSchema,
                    example: {
                        success: true,
                        data: {
                            id: '123e4567-e89b-12d3-a456-426614174000',
                            eventoId: '123e4567-e89b-12d3-a456-426614174001',
                            type: 'Fotografía de impacto ambiental',
                            description: 'Fotografía tomada durante la actividad de snorkel',
                            fileUrl: 'https://storage.example.com/evidencias/foto-123.jpg',
                            createdAt: '2024-01-15T10:30:00Z',
                            updatedAt: '2024-01-15T10:30:00Z',
                            EventoOperativo: {
                                id: '123e4567-e89b-12d3-a456-426614174001',
                                actividadId: '123e4567-e89b-12d3-a456-426614174002',
                                date: '2024-01-15T09:00:00Z',
                                status: 'completado',
                            },
                        },
                        message: 'Evidencia obtenida exitosamente',
                        timestamp: '2024-01-15T10:30:00Z',
                    },
                },
            },
        },
        ...commonErrorResponses,
    },
});
// PATCH /api/v1/organizations/{organizationId}/eventos/{eventoId}/evidencias/{evidenciaId}
registry.registerPath({
    method: 'patch',
    path: '/api/v1/organizations/{organizationId}/eventos/{eventoId}/evidencias/{evidenciaId}',
    summary: 'Actualizar evidencia ambiental',
    description: 'Actualiza los datos de una evidencia ambiental existente. Puede reemplazar el archivo o actualizar otros campos.',
    tags: ['Evidencias Ambientales'],
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización (ANP)'),
            eventoId: z.string().uuid().describe('ID del evento operativo'),
            evidenciaId: z.string().uuid().describe('ID de la evidencia ambiental'),
        }),
        body: {
            content: {
                'multipart/form-data': {
                    schema: z.object({
                        type: z.string().optional().describe('Nuevo tipo de evidencia'),
                        description: z.string().nullable().optional().describe('Nueva descripción'),
                        fileUrl: z.string().url().nullable().optional().describe('Nueva URL del archivo'),
                        file: z.any().optional().describe('Nuevo archivo a subir (multipart/form-data)'),
                    }),
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Evidencia actualizada exitosamente',
            content: {
                'application/json': {
                    schema: EvidenciaUpdatedResponseSchema,
                    example: {
                        success: true,
                        data: {
                            id: '123e4567-e89b-12d3-a456-426614174000',
                            eventoId: '123e4567-e89b-12d3-a456-426614174001',
                            type: 'Fotografía corregida de impacto ambiental',
                            description: 'Fotografía actualizada tomada durante la actividad de snorkel',
                            fileUrl: 'https://storage.example.com/evidencias/foto-456.jpg',
                            createdAt: '2024-01-15T10:30:00Z',
                            updatedAt: '2024-01-15T11:45:00Z',
                            EventoOperativo: {
                                id: '123e4567-e89b-12d3-a456-426614174001',
                                actividadId: '123e4567-e89b-12d3-a456-426614174002',
                                date: '2024-01-15T09:00:00Z',
                                status: 'completado',
                            },
                        },
                        message: 'Evidencia actualizada exitosamente',
                        timestamp: '2024-01-15T11:45:00Z',
                    },
                },
            },
        },
        ...commonErrorResponses,
    },
});
// DELETE /api/v1/organizations/{organizationId}/eventos/{eventoId}/evidencias/{evidenciaId}
registry.registerPath({
    method: 'delete',
    path: '/api/v1/organizations/{organizationId}/eventos/{eventoId}/evidencias/{evidenciaId}',
    summary: 'Eliminar evidencia ambiental',
    description: 'Elimina una evidencia ambiental y su archivo asociado del almacenamiento.',
    tags: ['Evidencias Ambientales'],
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización (ANP)'),
            eventoId: z.string().uuid().describe('ID del evento operativo'),
            evidenciaId: z.string().uuid().describe('ID de la evidencia ambiental'),
        }),
    },
    responses: {
        204: {
            description: 'Evidencia eliminada exitosamente',
        },
        ...commonErrorResponses,
    },
});
//# sourceMappingURL=evidencia.swagger.js.map