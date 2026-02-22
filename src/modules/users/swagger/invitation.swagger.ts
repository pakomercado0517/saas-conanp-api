import { z, registry, commonErrorResponses } from '@/shared/swagger/index.js';
import {
  ValidateInvitationTokenSchema,
  StartVerifyEmailSchema,
  ConfirmVerifyEmailSchema,
} from '../validators/invitation.validator.js';

/**
 * Respuesta genérica de invitación (validate)
 */
const ValidateInvitationResponseSchema = registry.register(
  'ValidateInvitationResponse',
  z.object({
    success: z.literal(true),
    data: z.object({
      valid: z.literal(true),
      email: z.string().email(),
      organizationId: z.string().uuid(),
      organizationName: z.string(),
      role: z.string(),
      expiresAt: z.string().datetime(),
    }),
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
  })
);

/**
 * Respuesta de verify-email/start
 */
const StartVerifyEmailResponseSchema = registry.register(
  'StartVerifyEmailResponse',
  z.object({
    success: z.literal(true),
    data: z.object({ message: z.string() }),
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
  })
);

/**
 * Respuesta de verify-email/confirm (incluye invitationProof para usar en POST /auth/register)
 */
const ConfirmVerifyEmailResponseSchema = registry.register(
  'ConfirmVerifyEmailResponse',
  z.object({
    success: z.literal(true),
    data: z.object({
      invitationProof: z.string().describe('Token para enviar en body de POST /auth/register'),
      invitationId: z.string().uuid(),
      email: z.string().email(),
      expiresAt: z.string().datetime(),
    }),
    message: z.string().optional(),
    timestamp: z.string().datetime().optional(),
  })
);

/**
 * Rutas públicas de invitaciones (pre-registro)
 */

// POST /api/v1/invitations/validate
registry.registerPath({
  method: 'post',
  path: '/api/v1/invitations/validate',
  tags: ['Invitaciones'],
  summary: 'Validar token de invitación',
  description:
    'Valida el token de una invitación (enlace). Devuelve datos de la organización y rol para mostrar el formulario de registro. Usar con invitationId + token en POST /auth/register (flujo enlace).',
  request: {
    body: {
      content: {
        'application/json': {
          schema: ValidateInvitationTokenSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Invitación válida',
      content: { 'application/json': { schema: ValidateInvitationResponseSchema } },
    },
    403: commonErrorResponses[403],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500],
  },
});

// POST /api/v1/invitations/verify-email/start
registry.registerPath({
  method: 'post',
  path: '/api/v1/invitations/verify-email/start',
  tags: ['Invitaciones'],
  summary: 'Iniciar verificación de email (código manual)',
  description:
    'Envía un código OTP al email de la invitación. Usar cuando el usuario ingresa el código de invitación manualmente; tras recibir el OTP, llamar a POST verify-email/confirm y luego registrar con invitationProof.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: StartVerifyEmailSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Si el email coincide con la invitación, se envió un código por correo',
      content: { 'application/json': { schema: StartVerifyEmailResponseSchema } },
    },
    400: commonErrorResponses[400],
    403: commonErrorResponses[403],
    404: commonErrorResponses[404],
    500: commonErrorResponses[500],
  },
});

// POST /api/v1/invitations/verify-email/confirm
registry.registerPath({
  method: 'post',
  path: '/api/v1/invitations/verify-email/confirm',
  tags: ['Invitaciones'],
  summary: 'Confirmar OTP y obtener comprobante',
  description:
    'Valida el código OTP recibido por correo y devuelve un invitationProof de un solo uso. Enviar invitationId, email e invitationProof en POST /auth/register para completar el registro (email quedará verificado).',
  request: {
    body: {
      content: {
        'application/json': {
          schema: ConfirmVerifyEmailSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Comprobante generado; usar en registro',
      content: { 'application/json': { schema: ConfirmVerifyEmailResponseSchema } },
    },
    400: commonErrorResponses[400],
    403: commonErrorResponses[403],
    500: commonErrorResponses[500],
  },
});
