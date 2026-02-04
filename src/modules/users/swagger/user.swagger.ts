import { z, registry, commonErrorResponses } from '@/shared/swagger/index.js';
import { UpdateProfileSchema, ChangePasswordSchema } from '../validators/user.validator.js';

/**
 * Schema de perfil de usuario en respuestas
 */
const UserProfileSchema = registry.register(
  'UserProfile',
  z.object({
    id: z.string().uuid().describe('ID único del usuario'),
    email: z.string().email().describe('Correo electrónico del usuario'),
    name: z.string().describe('Nombre completo del usuario'),
    createdAt: z.string().datetime().describe('Fecha de creación de la cuenta'),
    updatedAt: z.string().datetime().describe('Fecha de última actualización del perfil'),
  })
);

/**
 * Schema de respuesta de perfil de usuario
 */
const UserProfileResponseSchema = registry.register(
  'UserProfileResponse',
  z.object({
    success: z.literal(true).describe('Indica que la operación fue exitosa'),
    data: UserProfileSchema.describe('Datos del perfil del usuario'),
    message: z.string().optional().describe('Mensaje descriptivo opcional'),
    timestamp: z.string().datetime().optional().describe('Marca de tiempo de la respuesta'),
  })
);

/**
 * Registrar rutas de usuarios en OpenAPI
 */

// GET /api/v1/users/profile
registry.registerPath({
  method: 'get',
  path: '/api/v1/users/profile',
  tags: ['Usuarios'],
  summary: 'Obtener perfil del usuario',
  description:
    'Obtiene el perfil completo del usuario autenticado. Requiere token JWT válido en el header Authorization.',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Perfil obtenido exitosamente',
      content: {
        'application/json': {
          schema: UserProfileResponseSchema,
          examples: {
            success: {
              summary: 'Perfil obtenido',
              value: {
                success: true,
                data: {
                  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                  email: 'usuario@example.com',
                  name: 'Juan Pérez García',
                  createdAt: '2026-01-15T10:30:00.000Z',
                  updatedAt: '2026-02-01T14:20:00.000Z',
                },
                message: 'Perfil obtenido exitosamente',
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

// PATCH /api/v1/users/profile
registry.registerPath({
  method: 'patch',
  path: '/api/v1/users/profile',
  tags: ['Usuarios'],
  summary: 'Actualizar perfil del usuario',
  description:
    'Actualiza el perfil del usuario autenticado. Permite cambiar email y/o nombre. Al menos un campo es requerido.',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: UpdateProfileSchema,
          examples: {
            updateEmail: {
              summary: 'Actualizar solo email',
              value: {
                email: 'nuevo.email@example.com',
              },
            },
            updateBoth: {
              summary: 'Actualizar email y nombre',
              value: {
                email: 'nuevo.email@example.com',
                name: 'María González Martínez',
              },
            },
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Perfil actualizado exitosamente',
      content: {
        'application/json': {
          schema: UserProfileResponseSchema,
          examples: {
            success: {
              summary: 'Actualización exitosa',
              value: {
                success: true,
                data: {
                  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                  email: 'nuevo.email@example.com',
                  name: 'María González Martínez',
                  createdAt: '2026-01-15T10:30:00.000Z',
                  updatedAt: '2026-02-03T12:00:00.000Z',
                },
                message: 'Perfil actualizado exitosamente',
                timestamp: '2026-02-03T12:00:00.000Z',
              },
            },
          },
        },
      },
    },
    400: commonErrorResponses[400],
    401: commonErrorResponses[401],
    500: commonErrorResponses[500],
  },
});

// PATCH /api/v1/users/password
registry.registerPath({
  method: 'patch',
  path: '/api/v1/users/password',
  tags: ['Usuarios'],
  summary: 'Cambiar contraseña',
  description:
    'Cambia la contraseña del usuario autenticado. Requiere la contraseña actual para verificar identidad. La nueva contraseña debe ser diferente de la actual.',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: ChangePasswordSchema,
          examples: {
            example1: {
              summary: 'Cambio de contraseña',
              value: {
                currentPassword: 'MiPasswordActual123!',
                newPassword: 'MiNuevaPassword456!',
              },
            },
          },
        },
      },
    },
  },
  responses: {
    204: {
      description: 'Contraseña cambiada exitosamente (sin contenido)',
    },
    400: {
      description: 'Error de validación - Contraseña actual incorrecta o nueva contraseña inválida',
      content: {
        'application/json': {
          schema: commonErrorResponses[400].content['application/json'].schema,
          examples: {
            wrongPassword: {
              summary: 'Contraseña actual incorrecta',
              value: {
                success: false,
                error: 'Error de validación',
                message: 'La contraseña actual es incorrecta',
                code: 'WRONG_PASSWORD',
              },
            },
            samePassword: {
              summary: 'Nueva contraseña igual a la actual',
              value: {
                success: false,
                error: 'Error de validación',
                message: 'La nueva contraseña debe ser diferente de la contraseña actual',
                code: 'VALIDATION_ERROR',
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

// DELETE /api/v1/users/profile
registry.registerPath({
  method: 'delete',
  path: '/api/v1/users/profile',
  tags: ['Usuarios'],
  summary: 'Eliminar cuenta de usuario',
  description: `Elimina la cuenta del usuario autenticado (soft delete). 

**Validaciones:**
- El usuario no debe tener membresías activas en organizaciones
- Si tiene membresías activas, debe contactar a los administradores primero

**Acciones realizadas:**
- Revoca todos los refresh tokens del usuario
- Anonimiza datos personales (email y name)
- Realiza soft delete del usuario (deletedAt se establece)

**Nota:** Esta acción es irreversible. Los datos se anonimizan y no se pueden recuperar.`,
  security: [{ bearerAuth: [] }],
  responses: {
    204: {
      description: 'Cuenta eliminada exitosamente (sin contenido)',
    },
    400: {
      description:
        'Error de validación - El usuario tiene membresías activas u otras restricciones',
      content: {
        'application/json': {
          schema: commonErrorResponses[400].content['application/json'].schema,
          examples: {
            activeMemberships: {
              summary: 'Usuario con membresías activas',
              value: {
                success: false,
                error: 'Error de validación',
                message:
                  'No puedes eliminar tu cuenta mientras tengas membresías activas en organizaciones. Contacta a los administradores.',
                code: 'ACTIVE_MEMBERSHIPS',
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
