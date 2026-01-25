/**
 * Tipos e interfaces para respuestas API consistentes
 *
 * Estos tipos aseguran que todas las respuestas de la API sigan
 * una estructura consistente y tipada.
 */
/**
 * Respuesta exitosa estándar de la API
 *
 * @template T - Tipo de los datos retornados
 */
export interface SuccessResponse<T> {
    success: true;
    data: T;
    message?: string;
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
    timestamp: string;
}
//# sourceMappingURL=types.d.ts.map