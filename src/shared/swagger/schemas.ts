import { z } from './config.js';

/**
 * Schema de respuesta exitosa genérica
 * Nota: No se puede registrar en el registry aquí porque crea dependencia circular
 */
export function createSuccessResponseSchema<T extends z.ZodTypeAny>(
  dataSchema: T
): z.ZodObject<{
  success: z.ZodLiteral<true>;
  data: T;
  message: z.ZodOptional<z.ZodString>;
  timestamp: z.ZodOptional<z.ZodString>;
}> {
  return z.object({
    success: z.literal(true).describe('Indica que la operación fue exitosa'),
    data: dataSchema.describe('Datos de la respuesta'),
    message: z.string().optional().describe('Mensaje descriptivo opcional'),
    timestamp: z.string().datetime().optional().describe('Marca de tiempo de la respuesta'),
  });
}

// Alias para mantener compatibilidad
export const SuccessResponseSchema = createSuccessResponseSchema;

/**
 * Schema de respuesta de error
 */
export const ErrorResponseSchema = z.object({
  success: z.literal(false).describe('Indica que la operación falló'),
  error: z.string().describe('Tipo de error'),
  message: z.string().describe('Mensaje de error en español'),
  code: z.string().optional().describe('Código específico del error'),
  detalles: z.record(z.string(), z.unknown()).optional().describe('Detalles adicionales del error'),
  timestamp: z.string().datetime().optional().describe('Marca de tiempo del error'),
});

/**
 * Schema de metadata de paginación
 */
export const PaginationMetadataSchema = z.object({
  page: z.number().int().positive().describe('Página actual'),
  limit: z.number().int().positive().describe('Elementos por página'),
  total: z.number().int().nonnegative().describe('Total de elementos'),
  totalPages: z.number().int().nonnegative().describe('Total de páginas'),
});

/**
 * Schema de respuesta paginada genérica
 * Nota: No se puede registrar en el registry aquí porque crea dependencia circular
 */
export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(
  dataSchema: T
): z.ZodObject<{
  success: z.ZodLiteral<true>;
  data: z.ZodArray<T>;
  pagination: typeof PaginationMetadataSchema;
  timestamp: z.ZodOptional<z.ZodString>;
}> {
  return z.object({
    success: z.literal(true).describe('Indica que la operación fue exitosa'),
    data: z.array(dataSchema).describe('Array de elementos de la página actual'),
    pagination: PaginationMetadataSchema.describe('Metadata de paginación'),
    timestamp: z.string().datetime().optional().describe('Marca de tiempo de la respuesta'),
  });
}

// Alias para mantener compatibilidad
export const PaginatedResponseSchema = createPaginatedResponseSchema;

/**
 * Schema de parámetros de paginación
 */
export const PaginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1).describe('Número de página (comienza en 1)'),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(20)
    .describe('Elementos por página (máximo 100)'),
  sortBy: z.string().optional().describe('Campo por el cual ordenar'),
  sortOrder: z.enum(['asc', 'desc']).default('desc').describe('Orden de clasificación'),
});

/**
 * Schema de parámetro organizationId en URL
 */
export const OrganizationIdParamSchema = z.object({
  organizationId: z.string().uuid().describe('ID único de la organización (ANP)'),
});

/**
 * Respuestas de error comunes reutilizables
 */
export const commonErrorResponses = {
  400: {
    description: 'Error de validación - Los datos enviados no son válidos',
    content: {
      'application/json': {
        schema: ErrorResponseSchema,
        examples: {
          validationError: {
            summary: 'Error de validación',
            value: {
              success: false,
              error: 'Error de validación',
              message: 'Los datos proporcionados no son válidos',
              code: 'VALIDATION_ERROR',
              detalles: {
                campo: 'email',
                mensaje: 'El email no tiene un formato válido',
              },
            },
          },
        },
      },
    },
  },
  401: {
    description: 'No autorizado - Token inválido o expirado',
    content: {
      'application/json': {
        schema: ErrorResponseSchema,
        examples: {
          unauthorized: {
            summary: 'Token no válido',
            value: {
              success: false,
              error: 'No autorizado',
              message: 'Token inválido o expirado',
              code: 'UNAUTHORIZED',
            },
          },
        },
      },
    },
  },
  403: {
    description: 'Prohibido - No tienes permisos para realizar esta acción',
    content: {
      'application/json': {
        schema: ErrorResponseSchema,
        examples: {
          forbidden: {
            summary: 'Sin permisos',
            value: {
              success: false,
              error: 'Prohibido',
              message: 'No tienes permisos para realizar esta acción',
              code: 'FORBIDDEN',
            },
          },
        },
      },
    },
  },
  404: {
    description: 'No encontrado - El recurso solicitado no existe',
    content: {
      'application/json': {
        schema: ErrorResponseSchema,
        examples: {
          notFound: {
            summary: 'Recurso no encontrado',
            value: {
              success: false,
              error: 'No encontrado',
              message: 'El recurso solicitado no existe',
              code: 'NOT_FOUND',
            },
          },
        },
      },
    },
  },
  500: {
    description: 'Error interno del servidor',
    content: {
      'application/json': {
        schema: ErrorResponseSchema,
        examples: {
          serverError: {
            summary: 'Error del servidor',
            value: {
              success: false,
              error: 'Error interno',
              message: 'Ocurrió un error en el servidor. Por favor intenta nuevamente.',
              code: 'INTERNAL_ERROR',
            },
          },
        },
      },
    },
  },
};
