import { SUBSCRIPTION_LIMITS_LOCALS_KEY } from '../../shared/middleware/subscription-limits.middleware.js';
/** Convierte LimitsAndUsage a SubscriptionLimitsInfo para la respuesta. */
const toLimitsInfo = (limitsAndUsage) => ({
    limits: {
        maxUsers: limitsAndUsage.limits.maxUsers,
        maxEventos: limitsAndUsage.limits.maxEventos,
        maxActividades: limitsAndUsage.limits.maxActividades,
        planName: limitsAndUsage.limits.planName,
    },
    usage: limitsAndUsage.usage,
});
/**
 * Envía una respuesta exitosa estándar.
 * Si res.locals.subscriptionLimits está definido (por attachSubscriptionLimits),
 * incluye la información de límites en la respuesta.
 *
 * @param res - Objeto Response de Express
 * @param data - Datos a enviar en la respuesta
 * @param message - Mensaje opcional en español
 * @param statusCode - Código de estado HTTP (default: 200)
 * @returns Response de Express
 *
 * @example
 * ```typescript
 * sendSuccess(res, actividad, 'Actividad obtenida exitosamente');
 * ```
 */
export const sendSuccess = (res, data, message, statusCode = 200) => {
    const limitsData = res.locals?.[SUBSCRIPTION_LIMITS_LOCALS_KEY];
    const response = {
        success: true,
        data,
        ...(message && { message }),
        ...(limitsData && { limits: toLimitsInfo(limitsData) }),
        timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
};
/**
 * Envía una respuesta exitosa para recursos creados (201 Created)
 *
 * @param res - Objeto Response de Express
 * @param data - Datos del recurso creado
 * @param message - Mensaje opcional en español
 * @returns Response de Express
 *
 * @example
 * ```typescript
 * sendCreated(res, nuevaActividad, 'Actividad creada exitosamente');
 * ```
 */
export const sendCreated = (res, data, message) => {
    return sendSuccess(res, data, message, 201);
};
/**
 * Envía una respuesta sin contenido (204 No Content)
 *
 * Usado típicamente para operaciones de eliminación exitosas
 * donde no hay datos que retornar.
 *
 * @param res - Objeto Response de Express
 * @returns Response de Express
 *
 * @example
 * ```typescript
 * sendNoContent(res);
 * ```
 */
export const sendNoContent = (res) => {
    return res.status(204).send();
};
/**
 * Envía una respuesta paginada.
 * Si res.locals.subscriptionLimits está definido (por attachSubscriptionLimits),
 * incluye la información de límites en la respuesta.
 *
 * @param res - Objeto Response de Express
 * @param data - Array de datos a enviar
 * @param pagination - Metadata de paginación
 * @param message - Mensaje opcional en español
 * @returns Response de Express
 *
 * @example
 * ```typescript
 * const pagination = {
 *   page: 1,
 *   limit: 20,
 *   total: 100,
 *   totalPages: 5
 * };
 * sendPaginated(res, actividades, pagination, 'Actividades obtenidas');
 * ```
 */
export const sendPaginated = (res, data, pagination, message) => {
    const limitsData = res.locals?.[SUBSCRIPTION_LIMITS_LOCALS_KEY];
    const response = {
        success: true,
        data,
        pagination,
        ...(message && { message }),
        ...(limitsData && { limits: toLimitsInfo(limitsData) }),
        timestamp: new Date().toISOString(),
    };
    return res.status(200).json(response);
};
//# sourceMappingURL=helpers.js.map