import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry } from '@/shared/swagger/index.js';

// Extender Zod con funcionalidad OpenAPI
extendZodWithOpenApi(z);

const ROLE_VALUES = ['admin', 'gestor', 'prestador', 'observador'] as const;
const roleEnum = z
  .enum(ROLE_VALUES, {
    message: 'El rol debe ser: admin, gestor, prestador u observador',
  })
  .openapi({
    description: 'Rol del usuario en la organización',
    example: 'prestador',
  });

const STATUS_VALUES = ['activo', 'inactivo', 'suspendido'] as const;
const statusEnum = z
  .enum(STATUS_VALUES, {
    message: 'El estado debe ser: activo, inactivo o suspendido',
  })
  .openapi({
    description: 'Estado de la membresía',
    example: 'activo',
  });

/**
 * Schema Zod para crear/invitar membership
 */
export const CreateMembershipSchema = registry.register(
  'CreateMembership',
  z
    .object({
      userId: z
        .string()
        .uuid({
          message: 'El ID de usuario debe ser un UUID válido',
        })
        .describe('ID del usuario a invitar a la organización'),
      role: roleEnum.describe('Rol que tendrá el usuario en la organización'),
      status: statusEnum
        .optional()
        .default('activo')
        .describe('Estado inicial de la membresía (por defecto: activo)'),
    })
    .openapi({
      example: {
        userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        role: 'prestador',
        status: 'activo',
      },
    })
);

/**
 * Tipo TypeScript inferido desde CreateMembershipSchema
 */
export type CreateMembershipDTO = z.infer<typeof CreateMembershipSchema>;

/**
 * Schema Zod para actualizar membership (rol y estado)
 */
export const UpdateMembershipSchema = registry.register(
  'UpdateMembership',
  z
    .object({
      role: roleEnum.optional().describe('Nuevo rol del usuario (opcional)'),
      status: statusEnum.optional().describe('Nuevo estado de la membresía (opcional)'),
    })
    .refine((data) => data.role !== undefined || data.status !== undefined, {
      message: 'Debe incluir al menos un campo para actualizar (role o status)',
    })
    .openapi({
      example: {
        role: 'gestor',
        status: 'activo',
      },
    })
);

/**
 * Tipo TypeScript inferido desde UpdateMembershipSchema
 */
export type UpdateMembershipDTO = z.infer<typeof UpdateMembershipSchema>;

const SORT_FIELDS = ['role', 'status', 'createdAt', 'updatedAt'] as const;

/**
 * Schema Zod para enlistar memberships (query params: paginación y filtros)
 */
export const ListMembershipsSchema = registry.register(
  'ListMemberships',
  z.object({
    page: z.coerce
      .number()
      .int('La página debe ser un número entero')
      .positive('La página debe ser mayor a cero')
      .default(1)
      .describe('Número de página para la paginación'),
    limit: z.coerce
      .number()
      .int('El límite debe ser un número entero')
      .positive('El límite debe ser mayor a cero')
      .max(100, 'El límite no puede exceder 100')
      .default(20)
      .describe('Cantidad de elementos por página (máximo 100)'),
    sortBy: z
      .enum(SORT_FIELDS, {
        message: `Ordenar por debe ser uno de: ${SORT_FIELDS.join(', ')}`,
      })
      .optional()
      .describe('Campo por el cual ordenar los resultados'),
    sortOrder: z
      .enum(['asc', 'desc'], {
        message: 'El orden debe ser asc o desc',
      })
      .default('desc')
      .describe('Orden ascendente (asc) o descendente (desc)'),
    role: roleEnum.optional().describe('Filtrar por rol del usuario'),
    status: statusEnum.optional().describe('Filtrar por estado de la membresía'),
  })
);

/**
 * Tipo TypeScript inferido desde ListMembershipsSchema
 */
export type ListMembershipsDTO = z.infer<typeof ListMembershipsSchema>;
