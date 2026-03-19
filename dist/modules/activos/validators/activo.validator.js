import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry } from '../../../shared/swagger/index.js';
import { URL } from 'url';
// Extender Zod con funcionalidad OpenAPI
extendZodWithOpenApi(z);
// Constantes para enums reutilizables
const ACTIVO_TYPE_VALUES = ['embarcacion', 'vehiculo', 'guia', 'equipo'];
const ACTIVO_STATUS_VALUES = ['pendiente', 'aprobado', 'rechazado', 'suspendido'];
// Enums Zod
const activoTypeEnum = z
    .enum(ACTIVO_TYPE_VALUES, {
    error: 'El tipo debe ser: embarcacion, vehiculo, guia o equipo',
})
    .openapi({
    description: 'Tipo de activo: embarcacion, vehiculo, guia o equipo',
    example: 'embarcacion',
});
const activoStatusEnum = z
    .enum(ACTIVO_STATUS_VALUES, {
    error: 'El estado debe ser: pendiente, aprobado, rechazado o suspendido',
})
    .openapi({
    description: 'Estado del activo: pendiente, aprobado, rechazado o suspendido',
    example: 'pendiente',
});
/**
 * Schema Zod para validar URL con protocolos http/https
 */
const urlSchema = registry.register('Url', z
    .string({
    message: 'La URL del documento debe ser un texto',
})
    .url({
    message: 'La URL del documento debe ser una URL válida',
})
    .refine((url) => {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    }
    catch {
        return false;
    }
}, {
    message: 'La URL del documento debe usar el protocolo http o https',
})
    .openapi({
    description: 'URL del documento con protocolo http o https',
    example: 'https://example.com/document.pdf',
}));
/**
 * Schema Zod para crear activo
 */
export const CreateActivoSchema = registry.register('CreateActivo', z.object({
    organizationId: z
        .string({
        message: 'El ID de organización es requerido y debe ser un texto',
    })
        .uuid({
        message: 'El ID de organización debe ser un UUID válido',
    })
        .describe('ID de la organización (ANP) a la que pertenece el activo'),
    ownerId: z
        .string({
        message: 'El ID del propietario es requerido y debe ser un texto',
    })
        .uuid({
        message: 'El ID del propietario debe ser un UUID válido',
    })
        .describe('ID del usuario propietario del activo'),
    type: activoTypeEnum.describe('Tipo de activo'),
    status: activoStatusEnum
        .optional()
        .default('pendiente')
        .describe('Estado del activo (por defecto: pendiente)'),
}));
/**
 * Schema Zod para actualizar activo
 */
export const UpdateActivoSchema = registry.register('UpdateActivo', z
    .object({
    type: activoTypeEnum.optional().describe('Tipo de activo (opcional)'),
    status: activoStatusEnum.optional().describe('Estado del activo (opcional)'),
})
    .refine((data) => Object.keys(data).some((k) => data[k] !== undefined), {
    message: 'Debe incluir al menos un campo para actualizar',
}));
// Campos permitidos para ordenamiento
const SORT_FIELDS = ['type', 'status', 'createdAt', 'updatedAt'];
/**
 * Schema Zod para listar activos (query params: paginación y filtros)
 */
export const ListActivosSchema = registry.register('ListActivos', z.object({
    page: z.coerce
        .number('La página debe ser un número')
        .int('La página debe ser un número entero')
        .positive('La página debe ser mayor a cero')
        .default(1)
        .describe('Número de página para la paginación'),
    limit: z.coerce
        .number('El límite debe ser un número')
        .int('El límite debe ser un número entero')
        .positive('El límite debe ser mayor a cero')
        .max(100, 'El límite no puede exceder 100')
        .default(20)
        .describe('Cantidad de elementos por página (máximo 100)'),
    sortBy: z
        .enum(SORT_FIELDS, {
        error: `Ordenar por debe ser uno de: ${SORT_FIELDS.join(', ')}`,
    })
        .optional()
        .describe('Campo por el cual ordenar los resultados'),
    sortOrder: z
        .enum(['asc', 'desc'], {
        error: 'El orden debe ser asc o desc',
    })
        .default('desc')
        .describe('Orden ascendente (asc) o descendente (desc)'),
    ownerId: z
        .string()
        .uuid({
        message: 'El ID del propietario debe ser un UUID válido',
    })
        .optional()
        .transform((val) => (val === '' ? undefined : val))
        .describe('Filtrar por ID del propietario'),
    type: activoTypeEnum.optional().describe('Filtrar por tipo de activo'),
    status: activoStatusEnum.optional().describe('Filtrar por estado del activo'),
}));
/**
 * Schema Zod para crear requisito de activo
 */
export const CreateActivoRequisitoSchema = registry.register('CreateActivoRequisito', z.object({
    activoId: z
        .string({
        message: 'El ID de activo es requerido y debe ser un texto',
    })
        .uuid({
        message: 'El ID de activo debe ser un UUID válido',
    })
        .describe('ID del activo al que pertenece el requisito'),
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
        .trim()
        .describe('Clave única del requisito dentro del activo'),
    value: z.string().trim().optional().nullable().describe('Valor del requisito (opcional)'),
    documentUrl: urlSchema.optional().nullable().describe('URL del documento adjunto (opcional)'),
    validated: z
        .boolean({
        message: 'validated debe ser un valor booleano',
    })
        .optional()
        .default(false)
        .describe('Indica si el requisito ha sido validado (por defecto: false)'),
}));
/**
 * Schema Zod para actualizar requisito de activo
 * No se actualiza `key` (forma parte del único activoId+key).
 */
export const UpdateActivoRequisitoSchema = registry.register('UpdateActivoRequisito', z
    .object({
    value: z.string().trim().optional().nullable().describe('Valor del requisito (opcional)'),
    documentUrl: urlSchema.optional().nullable().describe('URL del documento adjunto (opcional)'),
    validated: z
        .boolean({ message: 'validated debe ser un valor booleano' })
        .optional()
        .describe('Indica si el requisito ha sido validado'),
})
    .refine((data) => Object.keys(data).some((k) => data[k] !== undefined), {
    message: 'Debe incluir al menos un campo para actualizar',
}));
const REQUISITO_SORT_FIELDS = ['key', 'validated', 'createdAt', 'updatedAt'];
/**
 * Schema Zod para listar requisitos de un activo (query params)
 * activoId se recibe por ruta.
 */
export const ListActivoRequisitosSchema = registry.register('ListActivoRequisitos', z.object({
    page: z.coerce
        .number('La página debe ser un número')
        .int('La página debe ser un número entero')
        .positive('La página debe ser mayor a cero')
        .default(1)
        .describe('Número de página para la paginación'),
    limit: z.coerce
        .number('El límite debe ser un número')
        .int('El límite debe ser un número entero')
        .positive('El límite debe ser mayor a cero')
        .max(100, 'El límite no puede exceder 100')
        .default(20)
        .describe('Cantidad de elementos por página (máximo 100)'),
    sortBy: z
        .enum(REQUISITO_SORT_FIELDS, {
        error: `Ordenar por debe ser uno de: ${REQUISITO_SORT_FIELDS.join(', ')}`,
    })
        .optional()
        .describe('Campo por el cual ordenar los resultados'),
    sortOrder: z
        .enum(['asc', 'desc'], { error: 'El orden debe ser asc o desc' })
        .default('asc')
        .describe('Orden ascendente (asc) o descendente (desc)'),
    validated: z.coerce
        .boolean({ message: 'validated debe ser un valor booleano' })
        .optional()
        .describe('Filtrar por estado de validación'),
}));
// --- Catálogo de requisitos de activos (por dependencia + tipoActivo) ---
const TIPO_DATO_CATALOGO_VALUES = ['string', 'date', 'number'];
const tipoDatoCatalogoEnum = z.enum(TIPO_DATO_CATALOGO_VALUES, {
    error: 'tipoDato debe ser: string, date o number',
});
/**
 * Schema para un ítem del catálogo (reutilizable en POST catálogo y en requisitoCatalogo al crear área).
 */
export const CreateActivoRequisitoCatalogoItemSchema = registry.register('CreateActivoRequisitoCatalogoItem', z.object({
    tipoActivo: activoTypeEnum.describe('Tipo de activo al que aplica'),
    key: z
        .string({ message: 'La clave es requerida' })
        .min(1)
        .max(255)
        .trim()
        .describe('Clave única del requisito'),
    label: z.string().max(255).trim().optional().nullable().describe('Etiqueta para la UI'),
    tipoDato: tipoDatoCatalogoEnum.describe('Tipo de dato del valor'),
    requerido: z.boolean().optional().default(false).describe('Si el requisito es obligatorio'),
    requiereDocumento: z
        .boolean()
        .optional()
        .default(false)
        .describe('Si debe adjuntarse documento'),
    orden: z.number().int().optional().nullable().describe('Orden en formularios'),
    activo: z.boolean().optional().default(true).describe('Si la definición está habilitada'),
}));
/**
 * Schema para crear una entrada en el catálogo (POST /activo-requisito-catalogo).
 */
export const CreateActivoRequisitoCatalogoSchema = registry.register('CreateActivoRequisitoCatalogo', CreateActivoRequisitoCatalogoItemSchema);
/**
 * Schema para actualizar una entrada del catálogo (PATCH). No se permite cambiar key ni tipoActivo.
 */
export const UpdateActivoRequisitoCatalogoSchema = registry.register('UpdateActivoRequisitoCatalogo', z
    .object({
    label: z.string().max(255).trim().optional().nullable(),
    tipoDato: tipoDatoCatalogoEnum.optional(),
    requerido: z.boolean().optional(),
    requiereDocumento: z.boolean().optional(),
    orden: z.number().int().optional().nullable(),
    activo: z.boolean().optional(),
})
    .refine((data) => Object.keys(data).some((k) => data[k] !== undefined), {
    message: 'Debe incluir al menos un campo para actualizar',
}));
/**
 * Schema para listar catálogo (query: tipoActivo opcional).
 */
export const ListActivoRequisitoCatalogoSchema = registry.register('ListActivoRequisitoCatalogo', z.object({
    tipoActivo: activoTypeEnum.optional().describe('Filtrar por tipo de activo'),
}));
//# sourceMappingURL=activo.validator.js.map