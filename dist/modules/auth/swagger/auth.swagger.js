import { z, registry, commonErrorResponses } from '@/shared/swagger/index.js';
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from '../validators/auth.validator.js';
/**
 * Schema de datos de usuario en respuestas
 */
const UserDataSchema = registry.register('UserData', z.object({
    id: z.string().uuid().describe('ID único del usuario'),
    email: z.string().email().describe('Correo electrónico del usuario'),
    name: z.string().describe('Nombre completo del usuario'),
    createdAt: z.string().datetime().describe('Fecha de creación del usuario'),
    updatedAt: z.string().datetime().describe('Fecha de última actualización'),
}));
/**
 * Schema de respuesta de autenticación (register y login)
 */
const AuthResponseSchema = registry.register('AuthResponse', z.object({
    success: z.literal(true).describe('Indica que la operación fue exitosa'),
    data: z.object({
        user: UserDataSchema.describe('Datos del usuario'),
        accessToken: z.string().describe('Token de acceso JWT para autenticación'),
        refreshToken: z.string().describe('Token para renovar el accessToken cuando expire'),
        expiresIn: z.number().describe('Tiempo de expiración del accessToken en segundos'),
    }),
    message: z.string().optional().describe('Mensaje descriptivo opcional'),
    timestamp: z.string().datetime().optional().describe('Marca de tiempo de la respuesta'),
}));
/**
 * Schema de respuesta de refresh token
 */
const RefreshResponseSchema = registry.register('RefreshTokenResponse', z.object({
    success: z.literal(true).describe('Indica que la operación fue exitosa'),
    data: z.object({
        accessToken: z.string().describe('Nuevo token de acceso JWT'),
        expiresIn: z.number().describe('Tiempo de expiración en segundos'),
    }),
    message: z.string().optional().describe('Mensaje descriptivo opcional'),
    timestamp: z.string().datetime().optional().describe('Marca de tiempo de la respuesta'),
}));
/**
 * Schema de respuesta de /me
 */
const MeResponseSchema = registry.register('MeResponse', z.object({
    success: z.literal(true).describe('Indica que la operación fue exitosa'),
    data: z.object({
        userId: z.string().uuid().describe('ID del usuario autenticado'),
        email: z.string().email().describe('Email del usuario autenticado'),
    }),
    message: z.string().optional().describe('Mensaje descriptivo opcional'),
    timestamp: z.string().datetime().optional().describe('Marca de tiempo de la respuesta'),
}));
/**
 * Registrar rutas de autenticación en OpenAPI
 */
// POST /api/v1/auth/register
registry.registerPath({
    method: 'post',
    path: '/api/v1/auth/register',
    tags: ['Autenticación'],
    summary: 'Registrar nuevo usuario',
    description: 'Crea una nueva cuenta. Requiere invitación válida: (1) invitationId + token (enlace; email queda verificado) o (2) invitationId + invitationProof (tras verificar email con OTP en flujo código manual). El email debe coincidir con el de la invitación.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: RegisterSchema,
                    examples: {
                        invitationLink: {
                            summary: 'Registro por enlace de invitación',
                            value: {
                                email: 'juan.perez@example.com',
                                password: 'MiPassword123!',
                                name: 'Juan Pérez García',
                                invitationId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                                token: 'token_recibido_por_correo',
                            },
                        },
                        invitationCode: {
                            summary: 'Registro por código manual (tras verify-email/confirm)',
                            value: {
                                email: 'juan.perez@example.com',
                                password: 'MiPassword123!',
                                name: 'Juan Pérez García',
                                invitationId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                                invitationProof: 'comprobante_obtenido_de_verify_email_confirm',
                            },
                        },
                    },
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Usuario registrado exitosamente',
            content: {
                'application/json': {
                    schema: AuthResponseSchema,
                    examples: {
                        success: {
                            summary: 'Registro exitoso',
                            value: {
                                success: true,
                                data: {
                                    user: {
                                        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                                        email: 'juan.perez@example.com',
                                        name: 'Juan Pérez García',
                                        createdAt: '2026-02-03T12:00:00.000Z',
                                        updatedAt: '2026-02-03T12:00:00.000Z',
                                    },
                                    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMWIyYzNkNCJ9.abc123',
                                    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMWIyYzNkNCIsInR5cGUiOiJyZWZyZXNoIn0.xyz789',
                                    expiresIn: 3600,
                                },
                                message: 'Usuario registrado exitosamente',
                                timestamp: '2026-02-03T12:00:00.000Z',
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
// POST /api/v1/auth/login
registry.registerPath({
    method: 'post',
    path: '/api/v1/auth/login',
    tags: ['Autenticación'],
    summary: 'Iniciar sesión',
    description: 'Autentica un usuario con email y contraseña. Retorna tokens JWT.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: LoginSchema,
                    examples: {
                        example1: {
                            summary: 'Login básico',
                            value: {
                                email: 'juan.perez@example.com',
                                password: 'MiPassword123!',
                            },
                        },
                    },
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Inicio de sesión exitoso',
            content: {
                'application/json': {
                    schema: AuthResponseSchema,
                },
            },
        },
        400: commonErrorResponses[400],
        401: commonErrorResponses[401],
        500: commonErrorResponses[500],
    },
});
// POST /api/v1/auth/refresh
registry.registerPath({
    method: 'post',
    path: '/api/v1/auth/refresh',
    tags: ['Autenticación'],
    summary: 'Renovar access token',
    description: 'Obtiene un nuevo access token usando un refresh token válido. Úsalo cuando el accessToken expire.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: RefreshTokenSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Token renovado exitosamente',
            content: {
                'application/json': {
                    schema: RefreshResponseSchema,
                    examples: {
                        success: {
                            summary: 'Renovación exitosa',
                            value: {
                                success: true,
                                data: {
                                    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMWIyYzNkNCJ9.newtoken123',
                                    expiresIn: 3600,
                                },
                                message: 'Token renovado exitosamente',
                                timestamp: '2026-02-03T12:00:00.000Z',
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
// POST /api/v1/auth/logout
registry.registerPath({
    method: 'post',
    path: '/api/v1/auth/logout',
    tags: ['Autenticación'],
    summary: 'Cerrar sesión',
    description: 'Revoca un refresh token. El usuario deberá volver a iniciar sesión.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: RefreshTokenSchema,
                },
            },
        },
    },
    responses: {
        204: {
            description: 'Sesión cerrada exitosamente (sin contenido)',
        },
        401: commonErrorResponses[401],
        500: commonErrorResponses[500],
    },
});
// GET /api/v1/auth/me
registry.registerPath({
    method: 'get',
    path: '/api/v1/auth/me',
    tags: ['Autenticación'],
    summary: 'Obtener usuario actual',
    description: 'Valida el token JWT actual y retorna información del usuario autenticado. Requiere token válido en el header Authorization.',
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: 'Token válido - Información del usuario',
            content: {
                'application/json': {
                    schema: MeResponseSchema,
                },
            },
        },
        401: commonErrorResponses[401],
        500: commonErrorResponses[500],
    },
});
//# sourceMappingURL=auth.swagger.js.map