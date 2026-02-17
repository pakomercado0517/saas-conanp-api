import { z } from 'zod';
/**
 * Schema Zod para registro de usuario
 */
export declare const RegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
}, z.core.$strip>;
/**
 * Tipo TypeScript inferido desde RegisterSchema
 */
export type RegisterDTO = z.infer<typeof RegisterSchema>;
/**
 * Schema Zod para login de usuario
 */
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
/**
 * Tipo TypeScript inferido desde LoginSchema
 */
export type LoginDTO = z.infer<typeof LoginSchema>;
/**
 * Schema Zod para refresh token
 */
export declare const RefreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, z.core.$strip>;
/**
 * Tipo TypeScript inferido desde RefreshTokenSchema
 */
export type RefreshTokenDTO = z.infer<typeof RefreshTokenSchema>;
/**
 * Schema Zod para reenviar email de verificación
 */
export declare const ResendVerificationSchema: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>;
/**
 * Tipo TypeScript inferido desde ResendVerificationSchema
 */
export type ResendVerificationDTO = z.infer<typeof ResendVerificationSchema>;
//# sourceMappingURL=auth.validator.d.ts.map