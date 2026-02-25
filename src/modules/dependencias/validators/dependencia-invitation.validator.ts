import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry } from '@/shared/swagger/index.js';

extendZodWithOpenApi(z);

const DEPENDENCIA_ROLE_VALUES = ['owner', 'admin', 'gestor', 'prestador', 'observador'] as const;
const roleEnum = z.enum(DEPENDENCIA_ROLE_VALUES, {
  message: 'El rol debe ser: owner, admin, gestor, prestador u observador',
});

const STATUS_VALUES = ['pending', 'accepted', 'expired', 'revoked'] as const;

export const CreateDependenciaInvitationSchema = registry.register(
  'CreateDependenciaInvitation',
  z.object({
    email: z
      .string()
      .email('El email debe ser válido')
      .max(255)
      .transform((val) => val.trim().toLowerCase()),
    role: roleEnum,
  })
);

export type CreateDependenciaInvitationDTO = z.infer<typeof CreateDependenciaInvitationSchema>;

export const ListDependenciaInvitationsSchema = registry.register(
  'ListDependenciaInvitations',
  z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.enum(['createdAt', 'expiresAt', 'email', 'status']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    status: z.enum(STATUS_VALUES).optional(),
  })
);

export type ListDependenciaInvitationsDTO = z.infer<typeof ListDependenciaInvitationsSchema>;
