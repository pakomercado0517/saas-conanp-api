import { z, registry, commonErrorResponses } from '../../../shared/swagger/index.js';
import { CreateEventoSchema, UpdateEventoSchema, ListEventosSchema, } from '../validators/evento.validator.js';
/**
 * Schema para respuesta de evento operativo
 */
const EventoResponseSchema = registry.register('EventoResponse', z
    .object({
    id: z.string().uuid().describe('ID único del evento operativo'),
    organizationId: z.string().uuid().describe('ID de la organización (ANP)'),
    prestadorId: z.string().uuid().describe('ID del prestador de servicios'),
    actividadId: z.string().uuid().describe('ID de la actividad turística'),
    date: z.string().describe('Fecha del evento en formato YYYY-MM-DD'),
    bloqueId: z
        .string()
        .uuid()
        .nullable()
        .describe('ID del bloque horario (null para HORARIO_LIBRE)'),
    startTime: z
        .string()
        .nullable()
        .describe('Hora de inicio en formato HH:mm:ss (null para BLOQUES)'),
    endTime: z
        .string()
        .nullable()
        .describe('Hora de fin en formato HH:mm:ss (null para BLOQUES)'),
    peopleCount: z.number().int().describe('Número de personas que participarán'),
    status: z
        .enum(['programado', 'en_curso', 'completado', 'cancelado'])
        .describe('Estado actual del evento'),
    paymentRequired: z.boolean().describe('Indica si el evento requiere pago'),
    paidAt: z
        .string()
        .datetime()
        .nullable()
        .describe('Fecha y hora del pago (null si no pagado)'),
    createdAt: z.string().datetime().describe('Fecha de creación del evento'),
    updatedAt: z.string().datetime().describe('Fecha de última actualización'),
    actividad: z
        .object({
        id: z.string().uuid(),
        name: z.string(),
        type: z.enum(['terrestre', 'maritima', 'mixta']),
        agendaType: z.enum(['BLOQUES', 'HORARIO_LIBRE']),
    })
        .optional()
        .describe('Información de la actividad'),
    prestador: z
        .object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        businessName: z.string(),
    })
        .optional()
        .describe('Información del prestador'),
    bloque: z
        .object({
        id: z.string().uuid(),
        name: z.string(),
        startTime: z.string(),
        endTime: z.string(),
    })
        .optional()
        .describe('Información del bloque horario'),
})
    .describe('Evento operativo con relaciones'));
/**
 * POST /api/v1/organizations/{organizationId}/eventos
 * Crear un nuevo evento operativo
 */
registry.registerPath({
    method: 'post',
    path: '/api/v1/organizations/{organizationId}/eventos',
    summary: 'Crear evento operativo',
    description: `Crea un nuevo evento operativo para una actividad turística.

**Validaciones de negocio:**
- El prestador debe tener un permiso vigente para la actividad
- Debe haber capacidad disponible para la fecha y bloque/horario
- Los activos requeridos deben estar aprobados
- No se permiten eventos en fechas pasadas

**Tipos de agenda:**
- **BLOQUES**: Requiere \`bloqueId\` (horarios predefinidos)
- **HORARIO_LIBRE**: Requiere \`startTime\` y \`endTime\` (horarios definidos por prestador)

**Permisos:** Administradores pueden crear eventos para cualquier prestador. Prestadores solo pueden crear sus propios eventos.`,
    tags: ['Eventos Operativos'],
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización (ANP)'),
        }),
        body: {
            content: {
                'application/json': {
                    schema: CreateEventoSchema,
                    example: {
                        actividadId: 'f336d0bc-b841-465b-8045-024475c079dd',
                        prestadorId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                        date: '2024-12-25',
                        agendaType: 'BLOQUES',
                        bloqueId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
                        peopleCount: 8,
                        paymentRequired: false,
                    },
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Evento creado exitosamente',
            content: {
                'application/json': {
                    schema: z.object({
                        success: z.boolean().describe('Indica si la operación fue exitosa'),
                        data: EventoResponseSchema,
                        message: z.string().describe('Mensaje descriptivo'),
                    }),
                },
            },
        },
        ...commonErrorResponses,
    },
});
/**
 * GET /api/v1/organizations/{organizationId}/eventos
 * Listar eventos operativos con paginación y filtros
 */
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations/{organizationId}/eventos',
    summary: 'Listar eventos operativos',
    description: `Obtiene una lista paginada de eventos operativos con filtros opcionales.

**Permisos:** Administradores ven todos los eventos. Prestadores solo ven sus propios eventos.`,
    tags: ['Eventos Operativos'],
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización (ANP)'),
        }),
        query: ListEventosSchema,
    },
    responses: {
        200: {
            description: 'Eventos obtenidos exitosamente',
            content: {
                'application/json': {
                    schema: z.object({
                        success: z.boolean().describe('Indica si la operación fue exitosa'),
                        data: z.array(EventoResponseSchema),
                        pagination: z.object({
                            page: z.number().int(),
                            limit: z.number().int(),
                            total: z.number().int(),
                            totalPages: z.number().int(),
                        }),
                        message: z.string().describe('Mensaje descriptivo'),
                    }),
                },
            },
        },
        ...commonErrorResponses,
    },
});
/**
 * GET /api/v1/organizations/{organizationId}/eventos/{eventoId}
 * Obtener evento operativo por ID
 */
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations/{organizationId}/eventos/{eventoId}',
    summary: 'Obtener evento operativo por ID',
    description: `Obtiene los detalles de un evento operativo específico.

**Permisos:** Administradores pueden ver cualquier evento. Prestadores solo pueden ver sus propios eventos.`,
    tags: ['Eventos Operativos'],
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización (ANP)'),
            eventoId: z.string().uuid().describe('ID del evento operativo'),
        }),
    },
    responses: {
        200: {
            description: 'Evento obtenido exitosamente',
            content: {
                'application/json': {
                    schema: z.object({
                        success: z.boolean().describe('Indica si la operación fue exitosa'),
                        data: EventoResponseSchema,
                        message: z.string().describe('Mensaje descriptivo'),
                    }),
                },
            },
        },
        ...commonErrorResponses,
    },
});
/**
 * PATCH /api/v1/organizations/{organizationId}/eventos/{eventoId}
 * Actualizar evento operativo
 */
registry.registerPath({
    method: 'patch',
    path: '/api/v1/organizations/{organizationId}/eventos/{eventoId}',
    summary: 'Actualizar evento operativo',
    description: `Actualiza un evento operativo existente.

**Validaciones de negocio:**
- Revalida capacidad si se cambian fecha, bloque u horario
- Revalida permisos del prestador
- No permite cambios en eventos completados o cancelados (excepto administradores)

**Permisos:** Administradores pueden actualizar cualquier evento. Prestadores solo pueden actualizar sus propios eventos.`,
    tags: ['Eventos Operativos'],
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización (ANP)'),
            eventoId: z.string().uuid().describe('ID del evento operativo'),
        }),
        body: {
            content: {
                'application/json': {
                    schema: UpdateEventoSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Evento actualizado exitosamente',
            content: {
                'application/json': {
                    schema: z.object({
                        success: z.boolean().describe('Indica si la operación fue exitosa'),
                        data: EventoResponseSchema,
                        message: z.string().describe('Mensaje descriptivo'),
                    }),
                },
            },
        },
        ...commonErrorResponses,
    },
});
/**
 * DELETE /api/v1/organizations/{organizationId}/eventos/{eventoId}
 * Eliminar evento operativo (soft delete)
 */
registry.registerPath({
    method: 'delete',
    path: '/api/v1/organizations/{organizationId}/eventos/{eventoId}',
    summary: 'Eliminar evento operativo',
    description: `Elimina un evento operativo (soft delete).

**Validaciones de negocio:**
- No permite eliminar eventos completados
- Libera la capacidad reservada

**Permisos:** Administradores pueden eliminar cualquier evento. Prestadores solo pueden eliminar sus propios eventos.`,
    tags: ['Eventos Operativos'],
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            organizationId: z.string().uuid().describe('ID de la organización (ANP)'),
            eventoId: z.string().uuid().describe('ID del evento operativo'),
        }),
    },
    responses: {
        204: {
            description: 'Evento eliminado exitosamente',
        },
        ...commonErrorResponses,
    },
});
//# sourceMappingURL=evento.swagger.js.map