import { z } from 'zod';
/**
 * Schema de respuesta exitosa genérica
 * Nota: No se puede registrar en el registry aquí porque crea dependencia circular
 */
export declare function createSuccessResponseSchema<T extends z.ZodTypeAny>(dataSchema: T): z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: T;
    message: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodOptional<z.ZodString>;
}>;
export declare const SuccessResponseSchema: typeof createSuccessResponseSchema;
/**
 * Schema de respuesta de error
 */
export declare const ErrorResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodString;
    message: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
    detalles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    timestamp: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Schema de metadata de paginación
 */
export declare const PaginationMetadataSchema: z.ZodObject<{
    page: z.ZodNumber;
    limit: z.ZodNumber;
    total: z.ZodNumber;
    totalPages: z.ZodNumber;
}, z.core.$strip>;
/**
 * Schema de respuesta paginada genérica
 * Nota: No se puede registrar en el registry aquí porque crea dependencia circular
 */
export declare function createPaginatedResponseSchema<T extends z.ZodTypeAny>(dataSchema: T): z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodArray<T>;
    pagination: typeof PaginationMetadataSchema;
    timestamp: z.ZodOptional<z.ZodString>;
}>;
export declare const PaginatedResponseSchema: typeof createPaginatedResponseSchema;
/**
 * Schema de parámetros de paginación
 */
export declare const PaginationParamsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
/**
 * Schema de parámetro organizationId en URL
 */
export declare const OrganizationIdParamSchema: z.ZodObject<{
    organizationId: z.ZodString;
}, z.core.$strip>;
/**
 * Respuestas de error comunes reutilizables
 */
export declare const commonErrorResponses: {
    400: {
        description: string;
        content: {
            'application/json': {
                schema: z.ZodObject<{
                    success: z.ZodLiteral<false>;
                    error: z.ZodString;
                    message: z.ZodString;
                    code: z.ZodOptional<z.ZodString>;
                    detalles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                    timestamp: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>;
                examples: {
                    validationError: {
                        summary: string;
                        value: {
                            success: boolean;
                            error: string;
                            message: string;
                            code: string;
                            detalles: {
                                campo: string;
                                mensaje: string;
                            };
                        };
                    };
                };
            };
        };
    };
    401: {
        description: string;
        content: {
            'application/json': {
                schema: z.ZodObject<{
                    success: z.ZodLiteral<false>;
                    error: z.ZodString;
                    message: z.ZodString;
                    code: z.ZodOptional<z.ZodString>;
                    detalles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                    timestamp: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>;
                examples: {
                    unauthorized: {
                        summary: string;
                        value: {
                            success: boolean;
                            error: string;
                            message: string;
                            code: string;
                        };
                    };
                };
            };
        };
    };
    403: {
        description: string;
        content: {
            'application/json': {
                schema: z.ZodObject<{
                    success: z.ZodLiteral<false>;
                    error: z.ZodString;
                    message: z.ZodString;
                    code: z.ZodOptional<z.ZodString>;
                    detalles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                    timestamp: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>;
                examples: {
                    forbidden: {
                        summary: string;
                        value: {
                            success: boolean;
                            error: string;
                            message: string;
                            code: string;
                        };
                    };
                };
            };
        };
    };
    404: {
        description: string;
        content: {
            'application/json': {
                schema: z.ZodObject<{
                    success: z.ZodLiteral<false>;
                    error: z.ZodString;
                    message: z.ZodString;
                    code: z.ZodOptional<z.ZodString>;
                    detalles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                    timestamp: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>;
                examples: {
                    notFound: {
                        summary: string;
                        value: {
                            success: boolean;
                            error: string;
                            message: string;
                            code: string;
                        };
                    };
                };
            };
        };
    };
    500: {
        description: string;
        content: {
            'application/json': {
                schema: z.ZodObject<{
                    success: z.ZodLiteral<false>;
                    error: z.ZodString;
                    message: z.ZodString;
                    code: z.ZodOptional<z.ZodString>;
                    detalles: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                    timestamp: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>;
                examples: {
                    serverError: {
                        summary: string;
                        value: {
                            success: boolean;
                            error: string;
                            message: string;
                            code: string;
                        };
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=schemas.d.ts.map