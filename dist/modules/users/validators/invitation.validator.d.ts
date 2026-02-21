import { z } from 'zod';
export declare const CreateInvitationSchema: z.ZodObject<{
    email: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    role: z.ZodEnum<{
        admin: "admin";
        gestor: "gestor";
        prestador: "prestador";
        observador: "observador";
    }>;
}, z.core.$strip>;
export type CreateInvitationDTO = z.infer<typeof CreateInvitationSchema>;
export declare const ListInvitationsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        createdAt: "createdAt";
        email: "email";
        status: "status";
        expiresAt: "expiresAt";
    }>>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        accepted: "accepted";
        expired: "expired";
        revoked: "revoked";
    }>>;
}, z.core.$strip>;
export type ListInvitationsDTO = z.infer<typeof ListInvitationsSchema>;
export declare const ValidateInvitationTokenSchema: z.ZodObject<{
    invitationId: z.ZodString;
    token: z.ZodString;
}, z.core.$strip>;
export type ValidateInvitationTokenDTO = z.infer<typeof ValidateInvitationTokenSchema>;
//# sourceMappingURL=invitation.validator.d.ts.map