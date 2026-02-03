import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry } from '@/shared/swagger/index.js';
import { optionalDateTimeSchema } from '@/shared/dates/zod-schemas.js';

// Extender Zod con funcionalidad OpenAPI
extendZodWithOpenApi(z);

// Constantes para enums reutilizables
const STATUS_VALUES = ['activo', 'inactivo', 'suspendido'] as const;

// Enum Zod para status
const statusEnum = z.enum(STATUS_VALUES, {
  error: 'El estado debe ser: activo, inactivo o suspendido',
});

/**
 * Schema Zod para crear perfil de prestador
 */
export const CreatePrestadorProfileSchema = registry.register(
  'CreatePrestadorProfile',
  z
    .object({
      userId: z
        .string({
          message: 'El ID de usuario es requerido y debe ser un texto',
        })
        .uuid({
          message: 'El ID de usuario debe ser un UUID válido',
        })
        .describe('ID del usuario'),
      organizationId: z
        .string({
          message: 'El ID de organización es requerido y debe ser un texto',
        })
        .uuid({
          message: 'El ID de organización debe ser un UUID válido',
        })
        .describe('ID de la organización'),
      status: statusEnum.optional().default('activo').describe('Estado del prestador'),
      permitExpiresAt: optionalDateTimeSchema.describe('Fecha de expiración del permiso (opcional)'),
    })
    .openapi({
      example: {
        userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        organizationId: 'b1c2d3e4-f5a6-7890-abcd-1234567890ab',
        status: 'activo',
        permitExpiresAt: '2026-12-31T23:59:59Z',
      },
    })
);

export type CreatePrestadorProfileDTO = z.infer<typeof CreatePrestadorProfileSchema>;

/**
 * Schema Zod para actualizar perfil de prestador
 */
export const UpdatePrestadorProfileSchema = registry.register(
  'UpdatePrestadorProfile',
  z
    .object({
      status: statusEnum.optional().describe('Nuevo estado del prestador'),
      permitExpiresAt: optionalDateTimeSchema.describe('Nueva fecha de expiración del permiso'),
    })
    .refine((data) => Object.keys(data).some((k) => (data as any)[k] !== undefined), {
      message: 'Debe incluir al menos un campo para actualizar',
    })
    .openapi({
      example: {
        status: 'suspendido',
      },
    })
);

export type UpdatePrestadorProfileDTO = z.infer<typeof UpdatePrestadorProfileSchema>;

// Campos permitidos para ordenamiento
const SORT_FIELDS = ['status', 'permitExpiresAt', 'createdAt', 'updatedAt'] as const;

/**
 * Schema Zod para listar prestadores (query params: paginación y filtros)
 */
export const ListPrestadoresSchema = registry.register(
  'ListPrestadores',
  z
    .object({
      page: z.coerce
        .number('La página debe ser un número')
        .int('La página debe ser un número entero')
        .positive('La página debe ser mayor a cero')
        .default(1)
        .describe('Página de resultados'),
      limit: z.coerce
        .number('El límite debe ser un número')
        .int('El límite debe ser un número entero')
        .positive('El límite debe ser mayor a cero')
        .max(100, 'El límite no puede exceder 100')
        .default(20)
        .describe('Límite por página'),
      sortBy: z
        .enum(SORT_FIELDS, {
          error: `Ordenar por debe ser uno de: ${SORT_FIELDS.join(', ')}`,
        })
        .optional()
        .describe('Campo por el cual ordenar'),
      sortOrder: z
        .enum(['asc', 'desc'], {
          error: 'El orden debe ser asc o desc',
        })
        .default('desc')
        .describe('Orden de clasificación'),
      status: statusEnum.optional().describe('Filtrar por estado'),
      userId: z
        .string()
        .uuid({
          message: 'El ID de usuario debe ser un UUID válido',
        })
        .optional()
        .transform((val) => (val === '' ? undefined : val))
        .describe('ID del usuario (opcional)'),
      permitExpiresAt: optionalDateTimeSchema.describe('Filtrar por fecha de expiración del permiso'),
    })
    .openapi({
      example: {
        page: 1,
        limit: 20,
        sortOrder: 'desc',
      },
    })
);

export type ListPrestadoresDTO = z.infer<typeof ListPrestadoresSchema>;
