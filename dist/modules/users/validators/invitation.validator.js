import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry } from '../../../shared/swagger/index.js';
extendZodWithOpenApi(z);
const ROLE_VALUES = ['admin', 'gestor', 'prestador', 'observador'];
const roleEnum = z.enum(ROLE_VALUES, {
    message: 'El rol debe ser: admin, gestor, prestador u observador',
});
const STATUS_VALUES = ['pending', 'accepted', 'expired', 'revoked'];
export const CreateInvitationSchema = registry.register('CreateInvitation', z
    .object({
    email: z
        .string()
        .email('El email debe ser válido')
        .max(255)
        .transform((val) => val.trim().toLowerCase())
        .describe('Email del invitado'),
    role: roleEnum.describe('Rol que tendrá al aceptar la invitación'),
})
    .openapi({
    example: { email: 'nuevo@ejemplo.com', role: 'prestador' },
}));
export const ListInvitationsSchema = registry.register('ListInvitations', z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.enum(['createdAt', 'expiresAt', 'email', 'status']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    status: z.enum(STATUS_VALUES).optional(),
}));
export const ValidateInvitationTokenSchema = registry.register('ValidateInvitationToken', z.object({
    invitationId: z.string().uuid('El ID de invitación debe ser un UUID válido'),
    token: z.string().min(1, 'El token es requerido'),
}));
/** Body para iniciar verificación de email (envío de OTP) en flujo código manual */
export const StartVerifyEmailSchema = registry.register('StartVerifyEmail', z.object({
    invitationId: z.string().uuid('ID de la invitación'),
    email: z
        .string()
        .email('Email debe ser válido')
        .transform((v) => v.trim().toLowerCase()),
}));
/** Body para confirmar OTP y obtener invitationProof */
export const ConfirmVerifyEmailSchema = registry.register('ConfirmVerifyEmail', z.object({
    invitationId: z.string().uuid('ID de la invitación'),
    email: z
        .string()
        .email('Email debe ser válido')
        .transform((v) => v.trim().toLowerCase()),
    otp: z.string().min(1, 'El código OTP es requerido').max(10),
}));
//# sourceMappingURL=invitation.validator.js.map