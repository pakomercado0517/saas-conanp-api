import { z } from 'zod';
import { optionalDateOnlySchema } from '@/shared/dates/zod-schemas.js';
import { registry } from '@/shared/swagger/index.js';

// Constantes para enums reutilizables
const EVENTO_STATUS_VALUES = ['programado', 'en_curso', 'completado', 'cancelado'] as const;
const PRESTADOR_STATUS_VALUES = ['activo', 'inactivo', 'suspendido'] as const;

// Enum Zod para status de evento
const eventoStatusEnum = z.enum(EVENTO_STATUS_VALUES, {
  error: 'El estado debe ser: programado, en_curso, completado o cancelado',
});

// Enum Zod para status de prestador
const prestadorStatusEnum = z.enum(PRESTADOR_STATUS_VALUES, {
  error: 'El estado debe ser: activo, inactivo o suspendido',
});

/**
 * Schema Zod para reporte de eventos por actividad
 */
export const ReporteEventosPorActividadSchema = z
  .object({
    actividadId: z
      .string()
      .uuid({
        message: 'El ID de actividad debe ser un UUID válido',
      })
      .optional()
      .transform((val) => (val === '' ? undefined : val)),
    dateFrom: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    dateTo: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    status: eventoStatusEnum.optional(),
  })
  .refine(
    (data) => {
      // Si ambos están presentes, dateFrom debe ser anterior a dateTo
      if (data.dateFrom && data.dateTo) {
        return data.dateFrom <= data.dateTo;
      }
      return true;
    },
    {
      message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin',
      path: ['dateTo'],
    }
  );

export type ReporteEventosPorActividadDTO = z.infer<typeof ReporteEventosPorActividadSchema>;

/**
 * Schema Zod para reporte de eventos por prestador
 */
export const ReporteEventosPorPrestadorSchema = z
  .object({
    prestadorId: z
      .string()
      .uuid({
        message: 'El ID de prestador debe ser un UUID válido',
      })
      .optional()
      .transform((val) => (val === '' ? undefined : val)),
    dateFrom: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    dateTo: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    status: eventoStatusEnum.optional(),
  })
  .refine(
    (data) => {
      if (data.dateFrom && data.dateTo) {
        return data.dateFrom <= data.dateTo;
      }
      return true;
    },
    {
      message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin',
      path: ['dateTo'],
    }
  );

export type ReporteEventosPorPrestadorDTO = z.infer<typeof ReporteEventosPorPrestadorSchema>;

/**
 * Schema Zod para reporte de eventos por fecha
 */
export const ReporteEventosPorFechaSchema = z
  .object({
    dateFrom: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    dateTo: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    actividadId: z
      .string()
      .uuid({
        message: 'El ID de actividad debe ser un UUID válido',
      })
      .optional()
      .transform((val) => (val === '' ? undefined : val)),
    prestadorId: z
      .string()
      .uuid({
        message: 'El ID de prestador debe ser un UUID válido',
      })
      .optional()
      .transform((val) => (val === '' ? undefined : val)),
  })
  .refine(
    (data) => {
      // Al menos uno de dateFrom o dateTo debe estar presente
      if (!data.dateFrom && !data.dateTo) {
        return false;
      }
      // Si ambos están presentes, dateFrom debe ser anterior o igual a dateTo
      if (data.dateFrom && data.dateTo) {
        return data.dateFrom <= data.dateTo;
      }
      return true;
    },
    {
      message:
        'Debe proporcionar al menos una fecha (dateFrom o dateTo), y si ambas están presentes, dateFrom debe ser anterior o igual a dateTo',
      path: ['dateFrom'],
    }
  );

export type ReporteEventosPorFechaDTO = z.infer<typeof ReporteEventosPorFechaSchema>;

/**
 * Schema Zod para reporte de capacidad utilizada
 */
export const ReporteCapacidadUtilizadaSchema = z
  .object({
    actividadId: z
      .string()
      .uuid({
        message: 'El ID de actividad debe ser un UUID válido',
      })
      .optional()
      .transform((val) => (val === '' ? undefined : val)),
    dateFrom: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
    dateTo: optionalDateOnlySchema.transform((val) => (val === null ? undefined : val)),
  })
  .refine(
    (data) => {
      if (data.dateFrom && data.dateTo) {
        return data.dateFrom <= data.dateTo;
      }
      return true;
    },
    {
      message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin',
      path: ['dateTo'],
    }
  );

export type ReporteCapacidadUtilizadaDTO = z.infer<typeof ReporteCapacidadUtilizadaSchema>;

/**
 * Schema Zod para reporte de prestadores activos
 */
export const ReportePrestadoresActivosSchema = z.object({
  status: prestadorStatusEnum.default('activo'),
  conPermisosVigentes: z.coerce
    .boolean({
      message: 'conPermisosVigentes debe ser un booleano',
    })
    .optional()
    .default(false),
});

export type ReportePrestadoresActivosDTO = z.infer<typeof ReportePrestadoresActivosSchema>;

// Registrar schemas en el registry de Swagger
registry.register('ReporteEventosPorActividad', ReporteEventosPorActividadSchema);
registry.register('ReporteEventosPorPrestador', ReporteEventosPorPrestadorSchema);
registry.register('ReporteEventosPorFecha', ReporteEventosPorFechaSchema);
registry.register('ReporteCapacidadUtilizada', ReporteCapacidadUtilizadaSchema);
registry.register('ReportePrestadoresActivos', ReportePrestadoresActivosSchema);
