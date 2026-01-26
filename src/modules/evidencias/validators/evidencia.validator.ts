import { z } from 'zod';
import { URL } from 'url';

/**
 * Schema Zod para validar URL con protocolos http/https
 */
const urlSchema = z
  .string({
    message: 'La URL del archivo debe ser un texto',
  })
  .url({
    message: 'La URL del archivo debe ser una URL válida',
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
      message: 'La URL del archivo debe usar el protocolo http o https',
    }
  );

/**
 * Schema Zod para crear evidencia ambiental
 */
export const CreateEvidenciaSchema = z.object({
  eventoId: z
    .string({
      message: 'El ID de evento es requerido y debe ser un texto',
    })
    .uuid({
      message: 'El ID de evento debe ser un UUID válido',
    }),
  type: z
    .string({
      message: 'El tipo de evidencia es requerido y debe ser un texto',
    })
    .min(1, {
      message: 'El tipo de evidencia no puede estar vacío',
    })
    .max(100, {
      message: 'El tipo de evidencia no puede exceder 100 caracteres',
    })
    .trim(),
  description: z
    .string({
      message: 'La descripción debe ser un texto',
    })
    .trim()
    .optional()
    .nullable(),
  fileUrl: urlSchema.optional().nullable(),
});

export type CreateEvidenciaDTO = z.infer<typeof CreateEvidenciaSchema>;

/**
 * Schema Zod para actualizar evidencia ambiental
 */
export const UpdateEvidenciaSchema = z
  .object({
    type: z
      .string({
        message: 'El tipo de evidencia debe ser un texto',
      })
      .min(1, {
        message: 'El tipo de evidencia no puede estar vacío',
      })
      .max(100, {
        message: 'El tipo de evidencia no puede exceder 100 caracteres',
      })
      .trim()
      .optional(),
    description: z
      .string({
        message: 'La descripción debe ser un texto',
      })
      .trim()
      .optional()
      .nullable(),
    fileUrl: urlSchema.optional().nullable(),
  })
  .refine((data) => Object.keys(data).some((k) => data[k as keyof typeof data] !== undefined), {
    message: 'Debe incluir al menos un campo para actualizar',
  });

export type UpdateEvidenciaDTO = z.infer<typeof UpdateEvidenciaSchema>;

// Campos permitidos para ordenamiento
const SORT_FIELDS = ['type', 'createdAt', 'updatedAt'] as const;

/**
 * Schema Zod para listar evidencias ambientales (query params: paginación y filtros)
 */
export const ListEvidenciasSchema = z.object({
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
  eventoId: z
    .string()
    .uuid({
      message: 'El ID de evento debe ser un UUID válido',
    })
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  type: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
});

export type ListEvidenciasDTO = z.infer<typeof ListEvidenciasSchema>;
