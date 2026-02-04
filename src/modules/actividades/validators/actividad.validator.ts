import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry } from '@/shared/swagger/index.js';

// Extender Zod con funcionalidad OpenAPI
extendZodWithOpenApi(z);

// Constantes para enums reutilizables
const ACTIVIDAD_TYPE_VALUES = ['terrestre', 'maritima', 'mixta'] as const;
const AGENDA_TYPE_VALUES = ['BLOQUES', 'HORARIO_LIBRE'] as const;

// Enums Zod
const actividadTypeEnum = z
  .enum(ACTIVIDAD_TYPE_VALUES, {
    message: 'El tipo debe ser: terrestre, maritima o mixta',
  })
  .openapi({
    description: 'Tipo de actividad según el ecosistema',
    example: 'maritima',
  });

const agendaTypeEnum = z
  .enum(AGENDA_TYPE_VALUES, {
    message: 'El tipo de agenda debe ser: BLOQUES o HORARIO_LIBRE',
  })
  .openapi({
    description:
      'Tipo de agenda para la actividad: BLOQUES (horarios predefinidos) o HORARIO_LIBRE (prestador define horarios)',
    example: 'BLOQUES',
  });

/**
 * Schema Zod para crear actividad
 */
export const CreateActividadSchema = registry.register(
  'CreateActividad',
  z
    .object({
      organizationId: z
        .string()
        .uuid({
          message: 'El ID de organización debe ser un UUID válido',
        })
        .describe('ID de la organización (ANP) a la que pertenece la actividad'),
      name: z
        .string()
        .min(1, {
          message: 'El nombre no puede estar vacío',
        })
        .max(255, {
          message: 'El nombre no puede exceder 255 caracteres',
        })
        .trim()
        .describe('Nombre de la actividad turística'),
      type: actividadTypeEnum.describe('Tipo de actividad según el ecosistema'),
      agendaType: agendaTypeEnum.describe('Tipo de agenda (BLOQUES o HORARIO_LIBRE)'),
      requiresGuide: z
        .boolean()
        .optional()
        .default(false)
        .describe('Indica si la actividad requiere guía obligatoriamente'),
      impactLevel: z
        .string()
        .max(50, {
          message: 'El nivel de impacto no puede exceder 50 caracteres',
        })
        .trim()
        .optional()
        .nullable()
        .describe('Nivel de impacto ambiental de la actividad (ej: bajo, medio, alto)'),
      active: z
        .boolean()
        .optional()
        .default(true)
        .describe('Indica si la actividad está activa y disponible'),
    })
    .openapi({
      example: {
        organizationId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
        name: 'Snorkel en arrecife',
        type: 'maritima',
        agendaType: 'BLOQUES',
        requiresGuide: true,
        impactLevel: 'medio',
        active: true,
      },
    })
);

export type CreateActividadDTO = z.infer<typeof CreateActividadSchema>;

/**
 * Schema Zod para actualizar actividad
 */
export const UpdateActividadSchema = registry.register(
  'UpdateActividad',
  z
    .object({
      name: z
        .string()
        .min(1, {
          message: 'El nombre no puede estar vacío',
        })
        .max(255, {
          message: 'El nombre no puede exceder 255 caracteres',
        })
        .trim()
        .optional()
        .describe('Nuevo nombre de la actividad (opcional)'),
      type: actividadTypeEnum.optional().describe('Nuevo tipo de actividad (opcional)'),
      agendaType: agendaTypeEnum.optional().describe('Nuevo tipo de agenda (opcional)'),
      requiresGuide: z.boolean().optional().describe('Actualizar si requiere guía (opcional)'),
      impactLevel: z
        .string()
        .max(50, {
          message: 'El nivel de impacto no puede exceder 50 caracteres',
        })
        .trim()
        .optional()
        .nullable()
        .describe('Nuevo nivel de impacto ambiental (opcional)'),
      active: z.boolean().optional().describe('Actualizar estado activo/inactivo (opcional)'),
    })
    .refine((data) => Object.keys(data).some((k) => data[k as keyof typeof data] !== undefined), {
      message: 'Debe incluir al menos un campo para actualizar',
    })
    .openapi({
      example: {
        name: 'Snorkel en arrecife - Actualizado',
        impactLevel: 'bajo',
        active: true,
      },
    })
);

export type UpdateActividadDTO = z.infer<typeof UpdateActividadSchema>;

// Campos permitidos para ordenamiento
const SORT_FIELDS = ['name', 'type', 'agendaType', 'active', 'createdAt', 'updatedAt'] as const;

/**
 * Schema Zod para listar actividades (query params: paginación y filtros)
 */
export const ListActividadesSchema = registry.register(
  'ListActividades',
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
    name: z
      .string()
      .trim()
      .optional()
      .transform((val) => (val === '' ? undefined : val))
      .describe('Filtrar por nombre (búsqueda parcial)'),
    type: actividadTypeEnum.optional().describe('Filtrar por tipo de actividad'),
    agendaType: agendaTypeEnum.optional().describe('Filtrar por tipo de agenda'),
    active: z.coerce.boolean().optional().describe('Filtrar por estado activo/inactivo'),
    requiresGuide: z.coerce.boolean().optional().describe('Filtrar por si requiere guía'),
  })
);

export type ListActividadesDTO = z.infer<typeof ListActividadesSchema>;
