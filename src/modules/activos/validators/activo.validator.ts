import { z } from 'zod';
import { URL } from 'url';

// Constantes para enums reutilizables
const ACTIVO_TYPE_VALUES = ['embarcacion', 'vehiculo', 'guia', 'equipo'] as const;
const ACTIVO_STATUS_VALUES = ['pendiente', 'aprobado', 'rechazado', 'suspendido'] as const;

// Enums Zod
const activoTypeEnum = z.enum(ACTIVO_TYPE_VALUES, {
  error: 'El tipo debe ser: embarcacion, vehiculo, guia o equipo',
});

const activoStatusEnum = z.enum(ACTIVO_STATUS_VALUES, {
  error: 'El estado debe ser: pendiente, aprobado, rechazado o suspendido',
});

/**
 * Schema Zod para validar URL con protocolos http/https
 */
const urlSchema = z
  .string({
    message: 'La URL del documento debe ser un texto',
  })
  .url({
    message: 'La URL del documento debe ser una URL válida',
  })
  .refine(
    (url) => {
      try {
        const parsedUrl = new URL(url as string);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
      } catch {
        return false;
      }
    },
    {
      message: 'La URL del documento debe usar el protocolo http o https',
    }
  );

/**
 * Schema Zod para crear activo
 */
export const CreateActivoSchema = z.object({
  organizationId: z
    .string({
      message: 'El ID de organización es requerido y debe ser un texto',
    })
    .uuid({
      message: 'El ID de organización debe ser un UUID válido',
    }),
  ownerId: z
    .string({
      message: 'El ID del propietario es requerido y debe ser un texto',
    })
    .uuid({
      message: 'El ID del propietario debe ser un UUID válido',
    }),
  type: activoTypeEnum,
  status: activoStatusEnum.optional().default('pendiente'),
});

export type CreateActivoDTO = z.infer<typeof CreateActivoSchema>;

/**
 * Schema Zod para actualizar activo
 */
export const UpdateActivoSchema = z
  .object({
    type: activoTypeEnum.optional(),
    status: activoStatusEnum.optional(),
  })
  .refine((data) => Object.keys(data).some((k) => data[k as keyof typeof data] !== undefined), {
    message: 'Debe incluir al menos un campo para actualizar',
  });

export type UpdateActivoDTO = z.infer<typeof UpdateActivoSchema>;

// Campos permitidos para ordenamiento
const SORT_FIELDS = ['type', 'status', 'createdAt', 'updatedAt'] as const;

/**
 * Schema Zod para listar activos (query params: paginación y filtros)
 */
export const ListActivosSchema = z.object({
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
  ownerId: z
    .string()
    .uuid({
      message: 'El ID del propietario debe ser un UUID válido',
    })
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  type: activoTypeEnum.optional(),
  status: activoStatusEnum.optional(),
});

export type ListActivosDTO = z.infer<typeof ListActivosSchema>;

/**
 * Schema Zod para crear requisito de activo
 */
export const CreateActivoRequisitoSchema = z.object({
  activoId: z
    .string({
      message: 'El ID de activo es requerido y debe ser un texto',
    })
    .uuid({
      message: 'El ID de activo debe ser un UUID válido',
    }),
  key: z
    .string({
      message: 'La clave del requisito es requerida',
    })
    .min(1, {
      message: 'La clave no puede estar vacía',
    })
    .max(255, {
      message: 'La clave no puede exceder 255 caracteres',
    })
    .trim(),
  value: z.string().trim().optional().nullable(),
  documentUrl: urlSchema.optional().nullable(),
  validated: z
    .boolean({
      message: 'validated debe ser un valor booleano',
    })
    .optional()
    .default(false),
});

export type CreateActivoRequisitoDTO = z.infer<typeof CreateActivoRequisitoSchema>;

/**
 * Schema Zod para actualizar requisito de activo
 * No se actualiza `key` (forma parte del único activoId+key).
 */
export const UpdateActivoRequisitoSchema = z
  .object({
    value: z.string().trim().optional().nullable(),
    documentUrl: urlSchema.optional().nullable(),
    validated: z.boolean({ message: 'validated debe ser un valor booleano' }).optional(),
  })
  .refine((data) => Object.keys(data).some((k) => data[k as keyof typeof data] !== undefined), {
    message: 'Debe incluir al menos un campo para actualizar',
  });

export type UpdateActivoRequisitoDTO = z.infer<typeof UpdateActivoRequisitoSchema>;

const REQUISITO_SORT_FIELDS = ['key', 'validated', 'createdAt', 'updatedAt'] as const;

/**
 * Schema Zod para listar requisitos de un activo (query params)
 * activoId se recibe por ruta.
 */
export const ListActivoRequisitosSchema = z.object({
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
    .enum(REQUISITO_SORT_FIELDS, {
      error: `Ordenar por debe ser uno de: ${REQUISITO_SORT_FIELDS.join(', ')}`,
    })
    .optional(),
  sortOrder: z.enum(['asc', 'desc'], { error: 'El orden debe ser asc o desc' }).default('asc'),
  validated: z.coerce.boolean({ message: 'validated debe ser un valor booleano' }).optional(),
});

export type ListActivoRequisitosDTO = z.infer<typeof ListActivoRequisitosSchema>;
