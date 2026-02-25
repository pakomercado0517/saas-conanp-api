import { z } from 'zod';
export declare const CreateDependenciaInvitationSchema: z.ZodObject<{
    email: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    role: z.ZodEnum<{
        admin: "admin";
        gestor: "gestor";
        prestador: "prestador";
        observador: "observador";
        owner: "owner";
    }>;
}, z.core.$strip>;
export type CreateDependenciaInvitationDTO = z.infer<typeof CreateDependenciaInvitationSchema>;
export declare const ListDependenciaInvitationsSchema: z.ZodObject<{
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
export type ListDependenciaInvitationsDTO = z.infer<typeof ListDependenciaInvitationsSchema>;
//# sourceMappingURL=dependencia-invitation.validator.d.ts.map