import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry } from '../../../shared/swagger/index.js';
// Extender Zod con funcionalidad OpenAPI
extendZodWithOpenApi(z);
/**
 * Schema Zod para registro de usuario
 */
export const RegisterSchema = registry.register('RegisterRequest', z.object({
    email: z
        .string({
        message: 'El email es requerido y debe ser un texto',
    })
        .email({
        message: 'El email debe tener un formato válido',
    })
        .toLowerCase()
        .trim()
        .describe('Correo electrónico del usuario. Debe ser único en el sistema.')
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
//# sourceMappingURL=auth.validator.js.map