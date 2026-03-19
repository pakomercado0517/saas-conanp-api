import { z, registry, commonErrorResponses } from '../../../shared/swagger/index.js';
import { CreateActivoSchema, UpdateActivoSchema, ListActivosSchema, CreateActivoRequisitoSchema, UpdateActivoRequisitoSchema, ListActivoRequisitosSchema, CreateActivoRequisitoCatalogoSchema, UpdateActivoRequisitoCatalogoSchema, ListActivoRequisitoCatalogoSchema, } from '../validators/activo.validator.js';
const ActivoSchema = registry.register('Activo', z.object({
    id: z.string().uuid().describe('ID único del activo'),
    organizationId: z.string().uuid().describe('ID de la organización (ANP)'),
    ownerId: z.string().uuid().describe('ID del propietario del activo'),
    type: z.enum(['embarcacion', 'vehiculo', 'guia', 'equipo']).describe('Tipo de activo'),
    status: z
        .enum(['pendiente', 'aprobado', 'rechazado', 'suspendido'])
        .describe('Estado del activo'),
    createdAt: z.string().datetime().describe('Fecha de creación'),
    updatedAt: z.string().datetime().describe('Fecha de última actualización'),
    Organization: z
        .object({
        id: z.string().uuid(),
        name: z.string(),
    })
        .optional()
        .describe('Información de la organización'),
    Owner: z
        .object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
    })
        .optional()
        .describe('Información del propietario'),
}));
const ActivoResponseSchema = registry.register('ActivoResponse', z.object({
    success: z.literal(true),
    data: ActivoSchema,
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
}));
const ActivoListResponseSchema = registry.register('ActivoListResponse', z.object({
    success: z.literal(true),
    data: z.array(ActivoSchema),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
    }),
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
}));
const ActivoRequisitoSchema = registry.register('ActivoRequisito', z.object({
    id: z.string().uuid().describe('ID único del requisito'),
    activoId: z.string().uuid().describe('ID del activo asociado'),
    key: z.string().describe('Clave del requisito'),
    value: z.string().nullable().describe('Valor del requisito'),
    documentUrl: z.string().nullable().describe('URL del documento del requisito'),
    validated: z.boolean().describe('Si el requisito está validado'),
    createdAt: z.string().datetime().describe('Fecha de creación'),
    updatedAt: z.string().datetime().describe('Fecha de última actualización'),
    Activo: z
        .object({
        id: z.string().uuid(),
        type: z.enum(['embarcacion', 'vehiculo', 'guia', 'equipo']),
    })
        .optional()
        .describe('Información del activo'),
}));
const ActivoRequisitoResponseSchema = registry.register('ActivoRequisitoResponse', z.object({
    success: z.literal(true),
    data: ActivoRequisitoSchema,
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
}));
const ActivoRequisitoListResponseSchema = registry.register('ActivoRequisitoListResponse', z.object({
    success: z.literal(true),
    data: z.array(ActivoRequisitoSchema),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
    }),
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
}));
// POST crear activo
registry.registerPath({
    method: 'post',
    path: '/api/v1/organizations/{organizationId}/activos',
    tags: ['Activos'],
    summary: 'Crear activo',
    description: 'Crea un nuevo activo (embarcación, vehículo, guía o equipo) para un prestador. Solo administradores pueden crear activos.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({ organizationId: z.string().uuid().describe('ID de la organización') }),
        body: {
            content: {
                'application/json': {
                    schema: CreateActivoSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Activo creado exitosamente',
            content: {
                'application/json': {
                    schema: ActivoResponseSchema,
                    examples: {
                        created: {
                            summary: 'Activo creado',
                            value: {
                                success: true,
                                data: {
                                    id: 'act1-2345-6789-abcd-ef1234567890',
                                    organizationId: 'org-1234-5678-90ab-cdef',
                                    ownerId: 'usr-1234-5678-90ab-cdef',
                                    type: 'embarcacion',
                                    status: 'pendiente',
                                    createdAt: '2026-02-03T12:00:00.000Z',
                                    updatedAt: '2026-02-03T12:00:00.000Z',
                                    Organization: {
                                        id: 'org-1234-5678-90ab-cdef',
                                        name: 'ANP Isla Mujeres',
                                    },
                                    Owner: {
                                        id: 'usr-1234-5678-90ab-cdef',
                                        userId: 'usr-1234-5678-90ab-cdef',
                                    },
                                },
                                message: 'Activo creado exitosamente',
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
// GET listar activos
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations/{organizationId}/activos',
    tags: ['Activos'],
    summary: 'Listar activos',
    description: 'Obtiene activos de la organización con paginación y filtros.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({ organizationId: z.string().uuid().describe('ID de la organización') }),
        query: ListActivosSchema,
    },
    responses: {
        200: {
            description: 'Activos obtenidos correctamente',
            content: {
                'application/json': {
                    schema: ActivoListResponseSchema,
                },
            },
        },
        401: commonErrorResponses[401],
        403: commonErrorResponses[403],
        500: commonErrorResponses[500],
    },
});
// GET obtener activo por id
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations/{organizationId}/activos/{activoId}',
    tags: ['Activos'],
    summary: 'Obtener activo por ID',
    description: 'Obtiene un activo por su ID dentro de la organización.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
            activoId: z.string().uuid().describe('ID del activo'),
        }),
    },
    responses: {
        200: {
            description: 'Activo obtenido exitosamente',
            content: {
                'application/json': {
                    schema: ActivoResponseSchema,
                },
            },
        },
        401: commonErrorResponses[401],
        403: commonErrorResponses[403],
        404: commonErrorResponses[404],
        500: commonErrorResponses[500],
    },
});
// PATCH actualizar activo
registry.registerPath({
    method: 'patch',
    path: '/api/v1/organizations/{organizationId}/activos/{activoId}',
    tags: ['Activos'],
    summary: 'Actualizar activo',
    description: 'Actualiza campos de un activo existente. Solo administradores pueden actualizar activos.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
            activoId: z.string().uuid().describe('ID del activo'),
        }),
        body: {
            content: {
                'application/json': {
                    schema: UpdateActivoSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Activo actualizado exitosamente',
            content: {
                'application/json': {
                    schema: ActivoResponseSchema,
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
// DELETE eliminar activo
registry.registerPath({
    method: 'delete',
    path: '/api/v1/organizations/{organizationId}/activos/{activoId}',
    tags: ['Activos'],
    summary: 'Eliminar activo',
    description: 'Elimina un activo (soft delete). Solo administradores pueden eliminar activos.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
            activoId: z.string().uuid().describe('ID del activo'),
        }),
    },
    responses: {
        204: {
            description: 'Activo eliminado exitosamente',
        },
        401: commonErrorResponses[401],
        403: commonErrorResponses[403],
        404: commonErrorResponses[404],
        500: commonErrorResponses[500],
    },
});
// POST aprobar activo
registry.registerPath({
    method: 'post',
    path: '/api/v1/organizations/{organizationId}/activos/{activoId}/aprobar',
    tags: ['Activos'],
    summary: 'Aprobar activo',
    description: 'Aprueba un activo cambiando su estado a "aprobado". Solo administradores pueden aprobar activos.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
            activoId: z.string().uuid().describe('ID del activo'),
        }),
    },
    responses: {
        200: {
            description: 'Activo aprobado exitosamente',
            content: {
                'application/json': {
                    schema: ActivoResponseSchema,
                },
            },
        },
        401: commonErrorResponses[401],
        403: commonErrorResponses[403],
        404: commonErrorResponses[404],
        500: commonErrorResponses[500],
    },
});
// POST crear requisito de activo
registry.registerPath({
    method: 'post',
    path: '/api/v1/organizations/{organizationId}/activos/{activoId}/requisitos',
    tags: ['Activos'],
    summary: 'Crear requisito de activo',
    description: 'Crea un requisito para un activo (documentos, certificados, etc.). Solo administradores pueden crear requisitos.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
            activoId: z.string().uuid().describe('ID del activo'),
        }),
        body: {
            content: {
                'application/json': {
                    schema: CreateActivoRequisitoSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Requisito de activo creado exitosamente',
            content: {
                'application/json': {
                    schema: ActivoRequisitoResponseSchema,
                    examples: {
                        created: {
                            summary: 'Requisito creado',
                            value: {
                                success: true,
                                data: {
                                    id: 'req1-2345-6789-abcd-ef1234567890',
                                    activoId: 'act1-2345-6789-abcd-ef1234567890',
                                    key: 'permiso_navegacion',
                                    value: 'Expediente 2026-001',
                                    documentUrl: 'https://example.com/doc.pdf',
                                    validated: false,
                                    createdAt: '2026-02-03T12:00:00.000Z',
                                    updatedAt: '2026-02-03T12:00:00.000Z',
                                    Activo: {
                                        id: 'act1-2345-6789-abcd-ef1234567890',
                                        type: 'embarcacion',
                                    },
                                },
                                message: 'Requisito de activo creado exitosamente',
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
// GET listar requisitos de activo
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations/{organizationId}/activos/{activoId}/requisitos',
    tags: ['Activos'],
    summary: 'Listar requisitos de activo',
    description: 'Obtiene requisitos de un activo con paginación y filtros.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
            activoId: z.string().uuid().describe('ID del activo'),
        }),
        query: ListActivoRequisitosSchema,
    },
    responses: {
        200: {
            description: 'Requisitos obtenidos correctamente',
            content: {
                'application/json': {
                    schema: ActivoRequisitoListResponseSchema,
                },
            },
        },
        401: commonErrorResponses[401],
        403: commonErrorResponses[403],
        500: commonErrorResponses[500],
    },
});
// PATCH actualizar requisito de activo
registry.registerPath({
    method: 'patch',
    path: '/api/v1/organizations/{organizationId}/activos/{activoId}/requisitos/{requisitoId}',
    tags: ['Activos'],
    summary: 'Actualizar requisito de activo',
    description: 'Actualiza un requisito de activo existente. Solo administradores pueden actualizar requisitos.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
            activoId: z.string().uuid().describe('ID del activo'),
            requisitoId: z.string().uuid().describe('ID del requisito'),
        }),
        body: {
            content: {
                'application/json': {
                    schema: UpdateActivoRequisitoSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Requisito de activo actualizado exitosamente',
            content: {
                'application/json': {
                    schema: ActivoRequisitoResponseSchema,
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
// DELETE eliminar requisito de activo
registry.registerPath({
    method: 'delete',
    path: '/api/v1/organizations/{organizationId}/activos/{activoId}/requisitos/{requisitoId}',
    tags: ['Activos'],
    summary: 'Eliminar requisito de activo',
    description: 'Elimina un requisito de activo. Solo administradores pueden eliminar requisitos.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización'),
            activoId: z.string().uuid().describe('ID del activo'),
            requisitoId: z.string().uuid().describe('ID del requisito'),
        }),
    },
    responses: {
        204: {
            description: 'Requisito de activo eliminado exitosamente',
        },
        401: commonErrorResponses[401],
        403: commonErrorResponses[403],
        404: commonErrorResponses[404],
        500: commonErrorResponses[500],
    },
});
// --- Catálogo de requisitos de activos ---
const ActivoRequisitoCatalogoSchema = registry.register('ActivoRequisitoCatalogo', z.object({
    id: z.string().uuid().describe('ID único de la entrada'),
    dependenciaId: z.string().uuid().describe('ID de la dependencia'),
    tipoActivo: z.enum(['embarcacion', 'vehiculo', 'guia', 'equipo']).describe('Tipo de activo'),
    key: z.string().describe('Clave del requisito'),
    label: z.string().nullable().describe('Etiqueta para la UI'),
    tipoDato: z.enum(['string', 'date', 'number']).describe('Tipo de dato del valor'),
    requerido: z.boolean().describe('Si es obligatorio'),
    requiereDocumento: z.boolean().describe('Si debe adjuntarse documento'),
    orden: z.number().nullable().describe('Orden en formularios'),
    activo: z.boolean().describe('Si la definición está habilitada'),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    Dependencia: z
        .object({ id: z.string().uuid(), name: z.string() })
        .optional()
        .describe('Dependencia'),
}));
const ActivoRequisitoCatalogoResponseSchema = registry.register('ActivoRequisitoCatalogoResponse', z.object({
    success: z.literal(true),
    data: ActivoRequisitoCatalogoSchema,
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
}));
const ActivoRequisitoCatalogoListResponseSchema = registry.register('ActivoRequisitoCatalogoListResponse', z.object({
    success: z.literal(true),
    data: z.array(ActivoRequisitoCatalogoSchema),
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
}));
// GET listar catálogo de requisitos
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations/{organizationId}/activo-requisito-catalogo',
    tags: ['Activos'],
    summary: 'Listar catálogo de requisitos de activos',
    description: 'Obtiene las definiciones de requisitos para la dependencia del área. Opcionalmente filtra por tipoActivo. Sirve para generar formularios dinámicos.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID del área (organización)'),
        }),
        query: ListActivoRequisitoCatalogoSchema,
    },
    responses: {
        200: {
            description: 'Catálogo obtenido exitosamente',
            content: {
                'application/json': {
                    schema: ActivoRequisitoCatalogoListResponseSchema,
                },
            },
        },
        401: commonErrorResponses[401],
        403: commonErrorResponses[403],
        500: commonErrorResponses[500],
    },
});
// POST crear entrada en catálogo
registry.registerPath({
    method: 'post',
    path: '/api/v1/organizations/{organizationId}/activo-requisito-catalogo',
    tags: ['Activos'],
    summary: 'Crear entrada en catálogo de requisitos',
    description: 'Añade una definición de requisito para la dependencia del área (tipoActivo + key únicos). Solo administradores.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID del área'),
        }),
        body: {
            content: {
                'application/json': {
                    schema: CreateActivoRequisitoCatalogoSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Entrada de catálogo creada exitosamente',
            content: {
                'application/json': {
                    schema: ActivoRequisitoCatalogoResponseSchema,
                },
            },
        },
        400: commonErrorResponses[400],
        401: commonErrorResponses[401],
        403: commonErrorResponses[403],
        409: {
            description: 'Ya existe una entrada con la misma key para este tipo de activo',
        },
        500: commonErrorResponses[500],
    },
});
// PATCH actualizar entrada del catálogo
registry.registerPath({
    method: 'patch',
    path: '/api/v1/organizations/{organizationId}/activo-requisito-catalogo/{catalogoId}',
    tags: ['Activos'],
    summary: 'Actualizar entrada del catálogo',
    description: 'Actualiza label, tipoDato, requerido, requiereDocumento, orden o activo. No se puede cambiar key ni tipoActivo. Solo administradores.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID del área'),
            catalogoId: z.string().uuid().describe('ID de la entrada del catálogo'),
        }),
        body: {
            content: {
                'application/json': {
                    schema: UpdateActivoRequisitoCatalogoSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Entrada de catálogo actualizada exitosamente',
            content: {
                'application/json': {
                    schema: ActivoRequisitoCatalogoResponseSchema,
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
// DELETE eliminar entrada del catálogo
registry.registerPath({
    method: 'delete',
    path: '/api/v1/organizations/{organizationId}/activo-requisito-catalogo/{catalogoId}',
    tags: ['Activos'],
    summary: 'Eliminar entrada del catálogo',
    description: 'Elimina una definición del catálogo de requisitos. Solo administradores.',
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID del área'),
            catalogoId: z.string().uuid().describe('ID de la entrada del catálogo'),
        }),
    },
    responses: {
        204: {
            description: 'Entrada de catálogo eliminada exitosamente',
        },
        401: commonErrorResponses[401],
        403: commonErrorResponses[403],
        404: commonErrorResponses[404],
        500: commonErrorResponses[500],
    },
});
export {};
//# sourceMappingURL=activo.swagger.js.map