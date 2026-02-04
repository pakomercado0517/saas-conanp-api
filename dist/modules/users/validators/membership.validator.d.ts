import { z } from 'zod';
/**
 * Schema Zod para crear/invitar membership
 */
export declare const CreateMembershipSchema: z.ZodObject<{
    userId: z.ZodString;
    role: z.ZodEnum<{
        admin: "admin";
        gestor: "gestor";
        prestador: "prestador";
        observador: "observador";
    }>;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        activo: "activo";
        inactivo: "inactivo";
        suspendido: "suspendido";
    }>>>;
}, z.core.$strip>;
/**
 * Tipo TypeScript inferido desde CreateMembershipSchema
 */
export type CreateMembershipDTO = z.infer<typeof CreateMembershipSchema>;
/**
 * Schema Zod para actualizar membership (rol y estado)
 */
export declare const UpdateMembershipSchema: z.ZodObject<{
    role: z.ZodOptional<z.ZodEnum<{
        admin: "admin";
        gestor: "gestor";
        prestador: "prestador";
        observador: "observador";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        activo: "activo";
        inactivo: "inactivo";
        suspendido: "suspendido";
    }>>;
}, z.core.$strip>;
/**
 * Tipo TypeScript inferido desde UpdateMembershipSchema
 */
export type UpdateMembershipDTO = z.infer<typeof UpdateMembershipSchema>;
/**
 * Schema Zod para enlistar memberships (query params: paginación y filtros)
 */
export declare const ListMembershipsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        createdAt: "createdAt";
        updatedAt: "updatedAt";
        role: "role";
        status: "status";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    role: z.ZodOptional<z.ZodEnum<{
        admin: "admin";
        gestor: "gestor";
        prestador: "prestador";
        observador: "observador";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        activo: "activo";
        inactivo: "inactivo";
        suspendido: "suspendido";
    }>>;
}, z.core.$strip>;
/**
 * Tipo TypeScript inferido desde ListMembershipsSchema
 */
export type ListMembershipsDTO = z.infer<typeof ListMembershipsSchema>;
//# sourceMappingURL=membership.validator.d.ts.map