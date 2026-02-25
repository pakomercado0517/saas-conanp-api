import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry } from '@/shared/swagger/index.js';

extendZodWithOpenApi(z);

const settingsSchema = z
  .record(z.string(), z.unknown())
  .refine((val) => val !== null && typeof val === 'object' && !Array.isArray(val), {
    message: 'Settings debe ser un objeto',
  });

export const CreateDependenciaSchema = registry.register(
  'CreateDependencia',
  z.object({
    name: z
      .string({ message: 'El nombre es requerido y debe ser un texto' })
      .min(1, { message: 'El nombre no puede estar vacío' })
      .max(255, { message: 'El nombre no puede exceder 255 caracteres' })
      .trim()
      .describe('Nombre de la dependencia'),
    settings: settingsSchema.optional().default({}).describe('Configuraciones (JSONB)'),
  })
);

export type CreateDependenciaDTO = z.infer<typeof CreateDependenciaSchema>;

export const UpdateDependenciaSchema = registry.register(
  'UpdateDependencia',
  z
    .object({
      name: z.string().min(1).max(255).trim().optional().describe('Nuevo nombre de la dependencia'),
      settings: settingsSchema.optional().describe('Nuevas configuraciones'),
    })
    .refine((data) => Object.keys(data).some((k) => data[k as keyof typeof data] !== undefined), {
      message: 'Debe incluir al menos un campo para actualizar',
    })
);

export type UpdateDependenciaDTO = z.infer<typeof UpdateDependenciaSchema>;

const SORT_FIELDS = ['name', 'createdAt', 'updatedAt'] as const;

export const ListDependenciasSchema = registry.register(
  'ListDependencias',
  z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.enum(SORT_FIELDS).optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    name: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v === '' ? undefined : v)),
  })
);

export type ListDependenciasDTO = z.infer<typeof ListDependenciasSchema>;

const ECOSYSTEM_VALUES = ['terrestre', 'maritimo', 'mixto'] as const;
const ecosystemTypeEnum = z.enum(ECOSYSTEM_VALUES, {
  error: 'El tipo de ecosistema debe ser: terrestre, maritimo o mixto',
});

export const CreateAreaUnderDependenciaSchema = registry.register(
  'CreateAreaUnderDependencia',
  z.object({
    name: z
      .string({ message: 'El nombre del área es requerido' })
      .min(1)
      .max(255)
      .trim()
      .describe('Nombre del área (ANP)'),
    ecosystem_type: ecosystemTypeEnum.describe('Tipo de ecosistema: terrestre, marítimo o mixto'),
    settings: settingsSchema.optional().default({}).describe('Configuraciones del área (JSONB)'),
  })
);

export type CreateAreaUnderDependenciaDTO = z.infer<typeof CreateAreaUnderDependenciaSchema>;

/** Schema para super admin: crear dependencia y solo enviar invitación al primer admin (sin área). */
export const CreateDependenciaAdminSchema = registry.register(
  'CreateDependenciaAdmin',
  z.object({
    name: z.string().min(1).max(255).trim().describe('Nombre de la dependencia'),
    admin_email: z.string().email().trim().toLowerCase().describe('Email del primer administrador'),
    settings: settingsSchema.optional().default({}),
  })
);

export type CreateDependenciaAdminDTO = z.infer<typeof CreateDependenciaAdminSchema>;
