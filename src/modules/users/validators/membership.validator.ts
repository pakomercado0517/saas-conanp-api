import { z } from 'zod';

const ROLE_VALUES = ['admin', 'gestor', 'prestador', 'observador'] as const;
const roleEnum = z.enum(ROLE_VALUES, {
  error: 'El rol debe ser: admin, gestor, prestador u observador',
});

const STATUS_VALUES = ['activo', 'inactivo', 'suspendido'] as const;
const statusEnum = z.enum(STATUS_VALUES, {
  error: 'El estado debe ser: activo, inactivo o suspendido',
});

/**
 * Schema Zod para crear/invitar membership
 */
export const CreateMembershipSchema = z.object({
  userId: z
    .string({
      message: 'El ID de usuario es requerido y debe ser un texto',
    })
    .uuid({
      message: 'El ID de usuario debe ser un UUID válido',
    }),
  role: roleEnum,
  status: statusEnum.optional().default('activo'),
});

/**
 * Tipo TypeScript inferido desde CreateMembershipSchema
 */
export type CreateMembershipDTO = z.infer<typeof CreateMembershipSchema>;

/**
 * Schema Zod para actualizar membership (rol y estado)
 */
export const UpdateMembershipSchema = z
  .object({
    role: roleEnum.optional(),
    status: statusEnum.optional(),
  })
  .refine((data) => data.role !== undefined || data.status !== undefined, {
    message: 'Debe incluir al menos un campo para actualizar (role o status)',
  });

/**
 * Tipo TypeScript inferido desde UpdateMembershipSchema
 */
export type UpdateMembershipDTO = z.infer<typeof UpdateMembershipSchema>;

const SORT_FIELDS = ['role', 'status', 'createdAt', 'updatedAt'] as const;

/**
 * Schema Zod para enlistar memberships (query params: paginación y filtros)
 */
export const ListMembershipsSchema = z.object({
  page: z.coerce
    .number('La página debe ser un número')
    .int('La página debe ser un número entero')
    .positive('La página debe ser mayor a cero')
    .default(1),
  limit: z.coerce
    .number('El límite debe ser un número')
    .int('El límite debe ser un número entero')
    .positive('El límite debe ser mayor a cero')
    .max(100, 'El límite no puede exceder 100')
    .default(20),
  sortBy: z
    .enum(SORT_FIELDS, {
      error: `Ordenar por debe ser uno de: ${SORT_FIELDS.join(', ')}`,
    })
    .optional(),
  sortOrder: z
    .enum(['asc', 'desc'], {
      error: 'El orden debe ser asc o desc',
    })
    .default('desc'),
  role: roleEnum.optional(),
  status: statusEnum.optional(),
});

/**
 * Tipo TypeScript inferido desde ListMembershipsSchema
 */
export type ListMembershipsDTO = z.infer<typeof ListMembershipsSchema>;
