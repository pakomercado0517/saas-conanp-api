import { z } from 'zod';
/**
 * Schema Zod para actualizar perfil de usuario
 */
export declare const UpdateProfileSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Tipo TypeScript inferido desde UpdateProfileSchema
 */
export type UpdateProfileDTO = z.infer<typeof UpdateProfileSchema>;
/**
 * Schema Zod para cambiar contraseña
 */
export declare const ChangePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
/**
 * Tipo TypeScript inferido desde ChangePasswordSchema
 */
export type ChangePasswordDTO = z.infer<typeof ChangePasswordSchema>;
//# sourceMappingURL=user.validator.d.ts.map