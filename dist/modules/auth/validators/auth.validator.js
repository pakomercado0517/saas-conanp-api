import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry } from '@/shared/swagger/index.js';
// Extender Zod con funcionalidad OpenAPI
extendZodWithOpenApi(z);
/**
 * Schema Zod para registro de usuario (solo con invitación válida)
 */
export const RegisterSchema = registry.register('RegisterRequest', z
    .object({
    email: z
        .string({
        message: 'El email es requerido y debe ser un texto',
    })
        .email({
        message: 'El email debe tener un formato válido',
    })
        .toLowerCase()
        .trim()
        .describe('Correo electrónico. Debe coincidir con el de la invitación.')
        .openapi({ example: 'usuario@example.com' }),
    password: z
        .string({
        message: 'La contraseña es requerida y debe ser un texto',
    })
        .min(8, {
        message: 'La contraseña debe tener al menos 8 caracteres',
    })
        .max(255, {
        message: 'La contraseña no puede exceder 255 caracteres',
    })
        .describe('Contraseña del usuario. Mínimo 8 caracteres.')
        .openapi({ example: 'MiPassword123!' }),
    name: z
        .string({
        message: 'El nombre es requerido y debe ser un texto',
    })
        .min(1, {
        message: 'El nombre no puede estar vacío',
    })
        .max(255, {
        message: 'El nombre no puede exceder 255 caracteres',
    })
        .trim()
        .describe('Nombre completo del usuario')
        .openapi({ example: 'Juan Pérez García' }),
    invitationId: z
        .string()
        .uuid('El ID de invitación debe ser un UUID válido')
        .describe('ID de la invitación recibida por correo')
        .optional(),
    token: z
        .string()
        .min(1, 'El token de invitación es requerido')
        .describe('Token de la invitación (enlace; usar con invitationId)')
        .optional(),
    invitationProof: z
        .string()
        .min(1, 'El comprobante de verificación es requerido')
        .describe('Comprobante obtenido tras verificar email con OTP (flujo código manual)')
        .optional(),
})
    .refine((data) => {
    if (data.invitationId == null)
        return true;
    const hasToken = data.token != null && data.token.length > 0;
    const hasProof = data.invitationProof != null && data.invitationProof.length > 0;
    return (hasToken && !hasProof) || (!hasToken && hasProof);
}, {
    message: 'Con invitationId debes enviar o bien token (enlace) o bien invitationProof (tras verificar email con código), pero no ambos',
    path: ['invitationId'],
})
    .refine((data) => data.invitationId == null || data.token != null || data.invitationProof != null, {
    message: 'invitationId requiere token o invitationProof',
    path: ['invitationId'],
}));
/**
 * Schema Zod para login de usuario
 */
export const LoginSchema = registry.register('LoginRequest', z.object({
    email: z
        .string({
        message: 'El email es requerido y debe ser un texto',
    })
        .email({
        message: 'El email debe tener un formato válido',
    })
        .toLowerCase()
        .trim()
        .describe('Correo electrónico del usuario registrado')
        .openapi({ example: 'usuario@example.com' }),
    password: z
        .string({
        message: 'La contraseña es requerida y debe ser un texto',
    })
        .min(1, {
        message: 'La contraseña no puede estar vacía',
    })
        .describe('Contraseña del usuario')
        .openapi({ example: 'MiPassword123!' }),
}));
/**
 * Schema Zod para refresh token
 */
export const RefreshTokenSchema = registry.register('RefreshTokenRequest', z.object({
    refreshToken: z
        .string({
        message: 'El refresh token es requerido y debe ser un texto',
    })
        .min(1, {
        message: 'El refresh token no puede estar vacío',
    })
        .describe('Token de refresco obtenido al hacer login o registro')
        .openapi({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3OCIsInR5cGUiOiJyZWZyZXNoIn0.abc123',
    }),
}));
/**
 * Schema Zod para reenviar email de verificación
 */
export const ResendVerificationSchema = registry.register('ResendVerificationRequest', z.object({
    email: z
        .string({
        message: 'El email es requerido y debe ser un texto',
    })
        .email({
        message: 'El email debe tener un formato válido',
    })
        .toLowerCase()
        .trim()
        .describe('Correo electrónico para reenviar verificación')
        .openapi({ example: 'usuario@example.com' }),
}));
/**
 * Schema Zod para solicitar recuperación de contraseña
 */
export const ForgotPasswordSchema = registry.register('ForgotPasswordRequest', z.object({
    email: z
        .string({
        message: 'El email es requerido y debe ser un texto',
    })
        .email({
        message: 'El email debe tener un formato válido',
    })
        .toLowerCase()
        .trim()
        .describe('Correo electrónico para enviar enlace de recuperación')
        .openapi({ example: 'usuario@example.com' }),
}));
/**
 * Schema Zod para restablecer contraseña con token
 */
export const ResetPasswordSchema = registry.register('ResetPasswordRequest', z.object({
    token: z
        .string({
        message: 'El token es requerido',
    })
        .min(10, {
        message: 'El token debe tener al menos 10 caracteres',
    })
        .describe('Token de recuperación recibido por email')
        .openapi({ example: 'abc123...' }),
    newPassword: z
        .string({
        message: 'La nueva contraseña es requerida',
    })
        .min(8, {
        message: 'La contraseña debe tener al menos 8 caracteres',
    })
        .max(255, {
        message: 'La contraseña no puede exceder 255 caracteres',
    })
        .describe('Nueva contraseña')
        .openapi({ example: 'NuevaPassword123!' }),
}));
//# sourceMappingURL=auth.validator.js.map