import { z } from 'zod';

/**
 * Schema Zod para registro de usuario
 */
export const RegisterSchema = z.object({
  email: z
    .string({
      message: 'El email es requerido y debe ser un texto',
    })
    .email({
      message: 'El email debe tener un formato válido',
    })
    .toLowerCase()
    .trim(),
  password: z
    .string({
      message: 'La contraseña es requerida y debe ser un texto',
    })
    .min(8, {
      message: 'La contraseña debe tener al menos 8 caracteres',
    })
    .max(255, {
      message: 'La contraseña no puede exceder 255 caracteres',
    }),
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
    .trim(),
});

/**
 * Tipo TypeScript inferido desde RegisterSchema
 */
export type RegisterDTO = z.infer<typeof RegisterSchema>;

/**
 * Schema Zod para login de usuario
 */
export const LoginSchema = z.object({
  email: z
    .string({
      message: 'El email es requerido y debe ser un texto',
    })
    .email({
      message: 'El email debe tener un formato válido',
    })
    .toLowerCase()
    .trim(),
  password: z
    .string({
      message: 'La contraseña es requerida y debe ser un texto',
    })
    .min(1, {
      message: 'La contraseña no puede estar vacía',
    }),
});

/**
 * Tipo TypeScript inferido desde LoginSchema
 */
export type LoginDTO = z.infer<typeof LoginSchema>;

/**
 * Schema Zod para refresh token
 */
export const RefreshTokenSchema = z.object({
  refreshToken: z
    .string({
      message: 'El refresh token es requerido y debe ser un texto',
    })
    .min(1, {
      message: 'El refresh token no puede estar vacío',
    }),
});

/**
 * Tipo TypeScript inferido desde RefreshTokenSchema
 */
export type RefreshTokenDTO = z.infer<typeof RefreshTokenSchema>;
