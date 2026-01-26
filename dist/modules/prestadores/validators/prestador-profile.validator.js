import { z } from 'zod';
import { optionalDateTimeSchema } from '../../../shared/dates/zod-schemas';
// Constantes para enums reutilizables
const STATUS_VALUES = ['activo', 'inactivo', 'suspendido'];
// Enum Zod para status
const statusEnum = z.enum(STATUS_VALUES, {
    error: 'El estado debe ser: activo, inactivo o suspendido',
});
/**
 * Schema Zod para crear perfil de prestador
 */
export const CreatePrestadorProfileSchema = z.object({
    userId: z
        .string({
        message: 'El ID de usuario es requerido y debe ser un texto',
    })
        .uuid({
        message: 'El ID de usuario debe ser un UUID válido',
    }),
    organizationId: z
        .string({
        message: 'El ID de organización es requerido y debe ser un texto',
    })
        .uuid({
        message: 'El ID de organización debe ser un UUID válido',
    }),
    status: statusEnum.optional().default('activo'),
    permitExpiresAt: optionalDateTimeSchema,
});
/**
 * Schema Zod para actualizar perfil de prestador
 */
export const UpdatePrestadorProfileSchema = z
    .object({
    status: statusEnum.optional(),
    permitExpiresAt: optionalDateTimeSchema,
})
    .refine((data) => Object.keys(data).some((k) => data[k] !== undefined), {
    message: 'Debe incluir al menos un campo para actualizar',
});
// Campos permitidos para ordenamiento
const SORT_FIELDS = ['status', 'permitExpiresAt', 'createdAt', 'updatedAt'];
/**
 * Schema Zod para listar prestadores (query params: paginación y filtros)
 */
export const ListPrestadoresSchema = z.object({
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
    status: statusEnum.optional(),
    userId: z
        .string()
        .uuid({
        message: 'El ID de usuario debe ser un UUID válido',
    })
        .optional()
        .transform((val) => (val === '' ? undefined : val)),
    permitExpiresAt: optionalDateTimeSchema,
});
//# sourceMappingURL=prestador-profile.validator.js.map