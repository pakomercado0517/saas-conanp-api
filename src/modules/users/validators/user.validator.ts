import { z } from 'zod';

/**
 * Schema Zod para actualizar perfil de usuario
 */
export const UpdateProfileSchema = z
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
      .optional(),
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
      .optional(),
  })
  .refine((data) => data.email !== undefined || data.name !== undefined, {
    message: 'Debe proporcionar al menos un campo para actualizar (email o name)',
  });

/**
 * Tipo TypeScript inferido desde UpdateProfileSchema
 */
export type UpdateProfileDTO = z.infer<typeof UpdateProfileSchema>;

/**
 * Schema Zod para cambiar contraseña
 */
export const ChangePasswordSchema = z
  .object({
    currentPassword: z
      .string({
        message: 'La contraseña actual es requerida y debe ser un texto',
      })
      .min(1, {
        message: 'La contraseña actual no puede estar vacía',
      }),
    newPassword: z
      .string({
        message: 'La nueva contraseña es requerida y debe ser un texto',
      })
      .min(8, {
        message: 'La nueva contraseña debe tener al menos 8 caracteres',
      })
      .max(255, {
        message: 'La nueva contraseña no puede exceder 255 caracteres',
      }),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'La nueva contraseña debe ser diferente de la contraseña actual',
    path: ['newPassword'],
  });

/**
 * Tipo TypeScript inferido desde ChangePasswordSchema
 */
export type ChangePasswordDTO = z.infer<typeof ChangePasswordSchema>;
