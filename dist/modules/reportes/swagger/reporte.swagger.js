import { z, registry, commonErrorResponses } from '../../../shared/swagger/index.js';
// Schema de respuesta para reporte de eventos por actividad
const ReporteEventosPorActividadItemSchema = registry.register('ReporteEventosPorActividadItem', z.object({
    actividadId: z.string().uuid().describe('ID único de la actividad'),
    actividadName: z.string().describe('Nombre de la actividad'),
    totalEventos: z.number().int().min(0).describe('Total de eventos realizados'),
    totalPersonas: z.number().int().min(0).describe('Total de personas atendidas'),
    eventosPorStatus: z
        .object({
        programado: z.number().int().min(0).describe('Eventos programados'),
        en_curso: z.number().int().min(0).describe('Eventos en curso'),
        completado: z.number().int().min(0).describe('Eventos completados'),
        cancelado: z.number().int().min(0).describe('Eventos cancelados'),
    })
        .describe('Conteo de eventos por estado'),
    fechaInicio: z.string().nullable().describe('Fecha de inicio del período (YYYY-MM-DD)'),
    fechaFin: z.string().nullable().describe('Fecha de fin del período (YYYY-MM-DD)'),
}));
// Schema de respuesta para reporte de eventos por prestador
const ReporteEventosPorPrestadorItemSchema = registry.register('ReporteEventosPorPrestadorItem', z.object({
    prestadorId: z.string().uuid().describe('ID único del prestador'),
    prestadorName: z.string().describe('Nombre del prestador'),
    totalEventos: z.number().int().min(0).describe('Total de eventos realizados'),
    totalPersonas: z.number().int().min(0).describe('Total de personas atendidas'),
    eventosPorStatus: z
        .object({
        programado: z.number().int().min(0).describe('Eventos programados'),
        en_curso: z.number().int().min(0).describe('Eventos en curso'),
        completado: z.number().int().min(0).describe('Eventos completados'),
        cancelado: z.number().int().min(0).describe('Eventos cancelados'),
    })
        .describe('Conteo de eventos por estado'),
    actividadesRealizadas: z
        .array(z.object({
        actividadId: z.string().uuid().describe('ID de la actividad'),
        actividadName: z.string().describe('Nombre de la actividad'),
        totalEventos: z.number().int().min(0).describe('Total de eventos para esta actividad'),
    }))
        .describe('Lista de actividades realizadas por el prestador'),
    fechaInicio: z.string().nullable().describe('Fecha de inicio del período (YYYY-MM-DD)'),
    fechaFin: z.string().nullable().describe('Fecha de fin del período (YYYY-MM-DD)'),
}));
// Schema de respuesta para reporte de eventos por fecha
const ReporteEventosPorFechaItemSchema = registry.register('ReporteEventosPorFechaItem', z.object({
    date: z.string().describe('Fecha del reporte (YYYY-MM-DD)'),
    totalEventos: z.number().int().min(0).describe('Total de eventos en la fecha'),
    totalPersonas: z.number().int().min(0).describe('Total de personas atendidas en la fecha'),
    eventosPorStatus: z
        .object({
        programado: z.number().int().min(0).describe('Eventos programados'),
        en_curso: z.number().int().min(0).describe('Eventos en curso'),
        completado: z.number().int().min(0).describe('Eventos completados'),
        cancelado: z.number().int().min(0).describe('Eventos cancelados'),
    })
        .describe('Conteo de eventos por estado'),
    actividades: z
        .array(z.object({
        actividadId: z.string().uuid().describe('ID de la actividad'),
        actividadName: z.string().describe('Nombre de la actividad'),
        totalEventos: z.number().int().min(0).describe('Total de eventos para esta actividad'),
        totalPersonas: z
            .number()
            .int()
            .min(0)
            .describe('Total de personas atendidas en esta actividad'),
    }))
        .describe('Actividades realizadas en la fecha'),
}));
// Schema de respuesta para reporte de capacidad utilizada
const ReporteCapacidadUtilizadaItemSchema = registry.register('ReporteCapacidadUtilizadaItem', z.object({
    actividadId: z.string().uuid().describe('ID único de la actividad'),
    actividadName: z.string().describe('Nombre de la actividad'),
    date: z.string().describe('Fecha del reporte (YYYY-MM-DD)'),
    bloqueId: z
        .string()
        .uuid()
        .nullable()
        .describe('ID del bloque (null para actividades sin bloques)'),
    bloqueName: z.string().nullable().describe('Nombre del bloque'),
    capacidadTotal: z.number().int().min(0).describe('Capacidad total disponible'),
    capacidadUtilizada: z.number().int().min(0).describe('Capacidad utilizada'),
    capacidadDisponible: z.number().int().min(0).describe('Capacidad disponible'),
    porcentajeUtilizacion: z.number().min(0).max(100).describe('Porcentaje de utilización (0-100)'),
}));
// Schema de respuesta para reporte de prestadores activos
const ReportePrestadoresActivosItemSchema = registry.register('ReportePrestadoresActivosItem', z.object({
    prestadorId: z.string().uuid().describe('ID único del prestador'),
    prestadorName: z.string().describe('Nombre del prestador'),
    status: z.enum(['activo', 'inactivo', 'suspendido']).describe('Estado del prestador'),
    permitExpiresAt: z.string().nullable().describe('Fecha de expiración del permiso más próximo'),
    totalEventos: z.number().int().min(0).describe('Total de eventos realizados'),
    totalPersonas: z.number().int().min(0).describe('Total de personas atendidas'),
    actividadesPermitidas: z.number().int().min(0).describe('Número de actividades permitidas'),
    ultimoEvento: z.string().nullable().describe('Fecha del último evento realizado (YYYY-MM-DD)'),
}));
// Schemas de respuesta para arrays
const ReporteEventosPorActividadResponseSchema = registry.register('ReporteEventosPorActividadResponse', z.array(ReporteEventosPorActividadItemSchema));
const ReporteEventosPorPrestadorResponseSchema = registry.register('ReporteEventosPorPrestadorResponse', z.array(ReporteEventosPorPrestadorItemSchema));
const ReporteEventosPorFechaResponseSchema = registry.register('ReporteEventosPorFechaResponse', z.array(ReporteEventosPorFechaItemSchema));
const ReporteCapacidadUtilizadaResponseSchema = registry.register('ReporteCapacidadUtilizadaResponse', z.array(ReporteCapacidadUtilizadaItemSchema));
const ReportePrestadoresActivosResponseSchema = registry.register('ReportePrestadoresActivosResponse', z.array(ReportePrestadoresActivosItemSchema));
// Documentación para endpoint: GET /api/v1/organizations/{organizationId}/reportes/eventos-por-actividad
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations/{organizationId}/reportes/eventos-por-actividad',
    summary: 'Obtener reporte de eventos agrupados por actividad',
    description: 'Obtiene un reporte que agrupa los eventos operativos por actividad, mostrando estadísticas de eventos y personas atendidas. Solo accesible para administradores.',
    tags: ['Reportes'],
    parameters: [
        {
            name: 'organizationId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'ID de la organización',
        },
        {
            name: 'actividadId',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'uuid' },
            description: 'Filtrar por ID de actividad específica',
        },
        {
            name: 'dateFrom',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'date' },
            description: 'Fecha de inicio del período (YYYY-MM-DD)',
        },
        {
            name: 'dateTo',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'date' },
            description: 'Fecha de fin del período (YYYY-MM-DD)',
        },
        {
            name: 'status',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['programado', 'en_curso', 'completado', 'cancelado'] },
            description: 'Filtrar por estado de los eventos',
        },
    ],
    responses: {
        200: {
            description: 'Reporte obtenido exitosamente',
            content: {
                'application/json': {
                    schema: ReporteEventosPorActividadResponseSchema,
                    example: [
                        {
                            actividadId: '550e8400-e29b-41d4-a716-446655440000',
                            actividadName: 'Snorkel en arrecife',
                            totalEventos: 15,
                            totalPersonas: 225,
                            eventosPorStatus: {
                                programado: 2,
                                en_curso: 1,
                                completado: 12,
                                cancelado: 0,
                            },
                            fechaInicio: '2024-01-01',
                            fechaFin: '2024-01-31',
                        },
                    ],
                },
            },
        },
        ...commonErrorResponses,
    },
});
// Documentación para endpoint: GET /api/v1/organizations/{organizationId}/reportes/eventos-por-prestador
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations/{organizationId}/reportes/eventos-por-prestador',
    summary: 'Obtener reporte de eventos agrupados por prestador',
    description: 'Obtiene un reporte que agrupa los eventos operativos por prestador, mostrando estadísticas de eventos, personas atendidas y actividades realizadas. Solo accesible para administradores.',
    tags: ['Reportes'],
    parameters: [
        {
            name: 'organizationId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'ID de la organización',
        },
        {
            name: 'prestadorId',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'uuid' },
            description: 'Filtrar por ID de prestador específico',
        },
        {
            name: 'dateFrom',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'date' },
            description: 'Fecha de inicio del período (YYYY-MM-DD)',
        },
        {
            name: 'dateTo',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'date' },
            description: 'Fecha de fin del período (YYYY-MM-DD)',
        },
        {
            name: 'status',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['programado', 'en_curso', 'completado', 'cancelado'] },
            description: 'Filtrar por estado de los eventos',
        },
    ],
    responses: {
        200: {
            description: 'Reporte obtenido exitosamente',
            content: {
                'application/json': {
                    schema: ReporteEventosPorPrestadorResponseSchema,
                    example: [
                        {
                            prestadorId: '550e8400-e29b-41d4-a716-446655440001',
                            prestadorName: 'Juan Pérez',
                            totalEventos: 8,
                            totalPersonas: 120,
                            eventosPorStatus: {
                                programado: 1,
                                en_curso: 0,
                                completado: 7,
                                cancelado: 0,
                            },
                            actividadesRealizadas: [
                                {
                                    actividadId: '550e8400-e29b-41d4-a716-446655440000',
                                    actividadName: 'Snorkel en arrecife',
                                    totalEventos: 5,
                                },
                            ],
                            fechaInicio: '2024-01-01',
                            fechaFin: '2024-01-31',
                        },
                    ],
                },
            },
        },
        ...commonErrorResponses,
    },
});
// Documentación para endpoint: GET /api/v1/organizations/{organizationId}/reportes/eventos-por-fecha
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations/{organizationId}/reportes/eventos-por-fecha',
    summary: 'Obtener reporte de eventos agrupados por fecha',
    description: 'Obtiene un reporte que agrupa los eventos operativos por fecha, mostrando estadísticas diarias de eventos y personas atendidas. Requiere al menos una fecha (inicio o fin). Solo accesible para administradores.',
    tags: ['Reportes'],
    parameters: [
        {
            name: 'organizationId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'ID de la organización',
        },
        {
            name: 'dateFrom',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'date' },
            description: 'Fecha de inicio del período (YYYY-MM-DD)',
        },
        {
            name: 'dateTo',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'date' },
            description: 'Fecha de fin del período (YYYY-MM-DD)',
        },
        {
            name: 'actividadId',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'uuid' },
            description: 'Filtrar por ID de actividad específica',
        },
        {
            name: 'status',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['programado', 'en_curso', 'completado', 'cancelado'] },
            description: 'Filtrar por estado de los eventos',
        },
    ],
    responses: {
        200: {
            description: 'Reporte obtenido exitosamente',
            content: {
                'application/json': {
                    schema: ReporteEventosPorFechaResponseSchema,
                    example: [
                        {
                            date: '2024-01-15',
                            totalEventos: 5,
                            totalPersonas: 75,
                            eventosPorStatus: {
                                programado: 1,
                                en_curso: 1,
                                completado: 3,
                                cancelado: 0,
                            },
                            actividades: [
                                {
                                    actividadId: '550e8400-e29b-41d4-a716-446655440000',
                                    actividadName: 'Snorkel en arrecife',
                                    totalEventos: 3,
                                    totalPersonas: 45,
                                },
                            ],
                        },
                    ],
                },
            },
        },
        ...commonErrorResponses,
    },
});
// Documentación para endpoint: GET /api/v1/organizations/{organizationId}/reportes/capacidad-utilizada
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations/{organizationId}/reportes/capacidad-utilizada',
    summary: 'Obtener reporte de capacidad utilizada',
    description: 'Obtiene un reporte que muestra la capacidad utilizada vs disponible para cada actividad, fecha y bloque. Solo accesible para administradores.',
    tags: ['Reportes'],
    parameters: [
        {
            name: 'organizationId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'ID de la organización',
        },
        {
            name: 'actividadId',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'uuid' },
            description: 'Filtrar por ID de actividad específica',
        },
        {
            name: 'dateFrom',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'date' },
            description: 'Fecha de inicio del período (YYYY-MM-DD)',
        },
        {
            name: 'dateTo',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'date' },
            description: 'Fecha de fin del período (YYYY-MM-DD)',
        },
        {
            name: 'bloqueId',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'uuid' },
            description: 'Filtrar por ID de bloque específico',
        },
    ],
    responses: {
        200: {
            description: 'Reporte obtenido exitosamente',
            content: {
                'application/json': {
                    schema: ReporteCapacidadUtilizadaResponseSchema,
                    example: [
                        {
                            actividadId: '550e8400-e29b-41d4-a716-446655440000',
                            actividadName: 'Snorkel en arrecife',
                            date: '2024-01-15',
                            bloqueId: '550e8400-e29b-41d4-a716-446655440002',
                            bloqueName: 'Mañana 09:00-12:00',
                            capacidadTotal: 20,
                            capacidadUtilizada: 15,
                            capacidadDisponible: 5,
                            porcentajeUtilizacion: 75.0,
                        },
                    ],
                },
            },
        },
        ...commonErrorResponses,
    },
});
// Documentación para endpoint: GET /api/v1/organizations/{organizationId}/reportes/prestadores-activos
registry.registerPath({
    method: 'get',
    path: '/api/v1/organizations/{organizationId}/reportes/prestadores-activos',
    summary: 'Obtener reporte de prestadores activos',
    description: 'Obtiene un reporte que muestra los prestadores activos, sus permisos vigentes y estadísticas de actividad. Solo accesible para administradores.',
    tags: ['Reportes'],
    parameters: [
        {
            name: 'organizationId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'ID de la organización',
        },
        {
            name: 'status',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['activo', 'inactivo', 'suspendido'], default: 'activo' },
            description: 'Filtro por estado del prestador',
        },
        {
            name: 'conPermisosVigentes',
            in: 'query',
            required: false,
            schema: { type: 'boolean', default: false },
            description: 'Filtrar solo prestadores con permisos vigentes',
        },
    ],
    responses: {
        200: {
            description: 'Reporte obtenido exitosamente',
            content: {
                'application/json': {
                    schema: ReportePrestadoresActivosResponseSchema,
                    example: [
                        {
                            prestadorId: '550e8400-e29b-41d4-a716-446655440001',
                            prestadorName: 'Juan Pérez',
                            status: 'activo',
                            permitExpiresAt: '2024-12-31T23:59:59.000Z',
                            totalEventos: 8,
                            totalPersonas: 120,
                            actividadesPermitidas: 3,
                            ultimoEvento: '2024-01-30',
                        },
                    ],
                },
            },
        },
        ...commonErrorResponses,
    },
});
//# sourceMappingURL=reporte.swagger.js.map