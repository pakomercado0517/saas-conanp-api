import { z } from 'zod';
// Constantes para enums reutilizables
const ACTIVIDAD_TYPE_VALUES = ['terrestre', 'maritima', 'mixta'];
const AGENDA_TYPE_VALUES = ['BLOQUES', 'HORARIO_LIBRE'];
// Enums Zod
const actividadTypeEnum = z.enum(ACTIVIDAD_TYPE_VALUES, {
    error: 'El tipo debe ser: terrestre, maritima o mixta',
});
const agendaTypeEnum = z.enum(AGENDA_TYPE_VALUES, {
    error: 'El tipo de agenda debe ser: BLOQUES o HORARIO_LIBRE',
});
/**
 * Schema Zod para crear actividad
 */
export const CreateActividadSchema = z.object({
    organizationId: z
        .string({
        message: 'El ID de organización es requerido y debe ser un texto',
    })
        .uuid({
        message: 'El ID de organización debe ser un UUID válido',
    }),
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
    type: actividadTypeEnum,
    agendaType: agendaTypeEnum,
    requiresGuide: z
        .boolean({
        message: 'requiresGuide debe ser un valor booleano',
    })
        .optional()
        .default(false),
    impactLevel: z
        .string({
        message: 'El nivel de impacto debe ser un texto',
    })
        .max(50, {
        message: 'El nivel de impacto no puede exceder 50 caracteres',
    })
        .trim()
        .optional()
        .nullable(),
    active: z
        .boolean({
        message: 'active debe ser un valor booleano',
    })
        .optional()
        .default(true),
});
/**
 * Schema Zod para actualizar actividad
 */
export const UpdateActividadSchema = z
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
    type: actividadTypeEnum.optional(),
    agendaType: agendaTypeEnum.optional(),
    requiresGuide: z
        .boolean({
        message: 'requiresGuide debe ser un valor booleano',
    })
        .optional(),
    impactLevel: z
        .string({
        message: 'El nivel de impacto debe ser un texto',
    })
        .max(50, {
        message: 'El nivel de impacto no puede exceder 50 caracteres',
    })
        .trim()
        .optional()
        .nullable(),
    active: z
        .boolean({
        message: 'active debe ser un valor booleano',
    })
        .optional(),
})
    .refine((data) => Object.keys(data).some((k) => data[k] !== undefined), {
    message: 'Debe incluir al menos un campo para actualizar',
});
// Campos permitidos para ordenamiento
const SORT_FIELDS = ['name', 'type', 'agendaType', 'active', 'createdAt', 'updatedAt'];
/**
 * Schema Zod para listar actividades (query params: paginación y filtros)
 */
export const ListActividadesSchema = z.object({
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
    type: actividadTypeEnum.optional(),
    agendaType: agendaTypeEnum.optional(),
    active: z.coerce
        .boolean({
        message: 'active debe ser un valor booleano',
    })
        .optional(),
    requiresGuide: z.coerce
        .boolean({
        message: 'requiresGuide debe ser un valor booleano',
    })
        .optional(),
});
//# sourceMappingURL=actividad.validator.js.map