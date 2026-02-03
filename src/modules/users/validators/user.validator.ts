import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry } from '@/shared/swagger/index.js';

// Extender Zod con funcionalidad OpenAPI
extendZodWithOpenApi(z);

/**
 * Schema Zod para actualizar perfil de usuario
 */
export const UpdateProfileSchema = registry.register(
  'UpdateProfileRequest',
  z
    .object({
      email: z
        .string({
          message: 'El email debe ser un texto',
        })
        .email({
          message: 'El email debe tener un formato válido',
        })
        .toLowerCase()
        .trim()
        .optional()
        .describe('Nuevo correo electrónico del usuario. Debe ser único en el sistema.')
        .openapi({ example: 'nuevo.email@example.com' }),
      name: z
        .string({
          message: 'El nombre debe ser un texto',
        })
        .min(1, {
          message: 'El nombre no puede estar vacío',
        })
        .max(255, {
          message: 'El nombre no puede exceder 255 caracteres',
        })
        .trim()
        .optional()
        .describe('Nuevo nombre completo del usuario')
        .openapi({ example: 'María González Martínez' }),
    })
    .refine((data) => data.email !== undefined || data.name !== undefined, {
      message: 'Debe proporcionar al menos un campo para actualizar (email o name)',
    })
);

/**
 * Tipo TypeScript inferido desde UpdateProfileSchema
 */
export type UpdateProfileDTO = z.infer<typeof UpdateProfileSchema>;

/**
 * Schema Zod para cambiar contraseña
 */
export const ChangePasswordSchema = registry.register(
  'ChangePasswordRequest',
  z
    .object({
      currentPassword: z
        .string({
          message: 'La contraseña actual es requerida y debe ser un texto',
        })
        .min(1, {
          message: 'La contraseña actual no puede estar vacía',
        })
        .describe('Contraseña actual del usuario para verificar identidad')
        .openapi({ example: 'MiPasswordActual123!' }),
      newPassword: z
        .string({
          message: 'La nueva contraseña es requerida y debe ser un texto',
        })
        .min(8, {
          message: 'La nueva contraseña debe tener al menos 8 caracteres',
        })
        .max(255, {
          message: 'La nueva contraseña no puede exceder 255 caracteres',
        })
        .describe('Nueva contraseña. Mínimo 8 caracteres. Debe ser diferente de la actual.')
        .openapi({ example: 'MiNuevaPassword456!' }),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: 'La nueva contraseña debe ser diferente de la contraseña actual',
      path: ['newPassword'],
    })
);

/**
 * Tipo TypeScript inferido desde ChangePasswordSchema
 */
export type ChangePasswordDTO = z.infer<typeof ChangePasswordSchema>;
