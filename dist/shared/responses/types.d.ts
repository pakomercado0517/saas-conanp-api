/**
 * Tipos e interfaces para respuestas API consistentes
 *
 * Estos tipos aseguran que todas las respuestas de la API sigan
 * una estructura consistente y tipada.
 */
/**
 * Información de límites de suscripción para respuestas API
 */
export interface SubscriptionLimitsInfo {
    limits: {
        maxUsers: number | null;
        maxEventos: number | null;
        maxActividades: number | null;
        planName: string;
    };
    usage: {
        usersCount: number;
        eventosCount: number;
        actividadesCount: number;
    };
}
/**
 * Respuesta exitosa estándar de la API
 *
 * @template T - Tipo de los datos retornados
 */
export interface SuccessResponse<T> {
    success: true;
    data: T;
    message?: string;
    /** Información de límites de suscripción (cuando está disponible) */
    limits?: SubscriptionLimitsInfo;
    timestamp: string;
}
/**
 * Metadata de paginación para respuestas paginadas
 */
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
/**
 * Respuesta paginada de la API
 *
 * @template T - Tipo de los elementos en la lista
 */
export interface PaginatedResponse<T> {
    success: true;
    data: T[];
    pagination: PaginationMeta;
    message?: string;
    /** Información de límites de suscripción (cuando está disponible) */
    limits?: SubscriptionLimitsInfo;
    timestamp: string;
}
//# sourceMappingURL=types.d.ts.map