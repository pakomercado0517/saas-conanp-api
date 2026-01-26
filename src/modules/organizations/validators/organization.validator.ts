import { z } from 'zod';

const ECOSYSTEM_VALUES = ['terrestre', 'maritimo', 'mixto'] as const;
const ecosystemTypeEnum = z.enum(ECOSYSTEM_VALUES, {
  error: 'El tipo de ecosistema debe ser: terrestre, maritimo o mixto',
});

const settingsSchema = z.record(z.string(), z.unknown()).refine((val) => !Array.isArray(val), {
  message: 'Settings debe ser un objeto',
});

/**
 * Schema Zod para crear organización
 */
export const CreateOrganizationSchema = z.object({
  name: z
    .string({
      message: 'El nombre es requerido y debe ser un texto',
    })
    .min(1, {
      message: 'El nombre no puede estar vacío',
    })
    .max(255, {
      message: 'El nombre no puede exceder 255 caracteres',
    })
    .trim(),
  ecosystem_type: ecosystemTypeEnum,
  settings: settingsSchema.optional().default({}),
});

export type CreateOrganizationDTO = z.infer<typeof CreateOrganizationSchema>;

/**
 * Schema Zod para actualizar organización
 */
export const UpdateOrganizationSchema = z
  .object({
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
    ecosystem_type: ecosystemTypeEnum.optional(),
    settings: settingsSchema.optional(),
  })
  .refine((data) => Object.keys(data).some((k) => data[k as keyof typeof data] !== undefined), {
    message: 'Debe incluir al menos un campo para actualizar',
  });

export type UpdateOrganizationDTO = z.infer<typeof UpdateOrganizationSchema>;

const SORT_FIELDS = ['name', 'createdAt', 'ecosystem_type', 'updatedAt'] as const;

/**
 * Schema Zod para enlistar organizaciones (query params: paginación y filtros)
 */
export const ListOrganizationsSchema = z.object({
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
  name: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  ecosystem_type: ecosystemTypeEnum.optional(),
});

export type ListOrganizationsDTO = z.infer<typeof ListOrganizationsSchema>;
