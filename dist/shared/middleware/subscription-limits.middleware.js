import { BadRequestError } from '../../shared/errors/index.js';
import { assertActiveSubscription } from '../../modules/organizations/services/organization.service.js';
import { checkUsersLimit, checkEventosLimit, checkActividadesLimit, getLimitsAndUsage, } from '../../modules/subscriptions/services/subscription-limits.service.js';
/** Clave en res.locals para la información de límites */
export const SUBSCRIPTION_LIMITS_LOCALS_KEY = 'subscriptionLimits';
/**
 * Obtiene organizationId del request.
 * Debe ejecutarse después de requireOrganizationAccess.
 */
const getOrganizationId = (req) => {
    return req.organizationId ?? req.params['organizationId'];
};
/**
 * Middleware que exige suscripción activa (active o trialing) para continuar.
 * Bloquea si la organización no tiene suscripción o está inactiva/past_due/cancelada.
 * Úsalo en rutas que crean o modifican recursos (eventos, actividades, etc.).
 *
 * Debe ejecutarse después de: authenticate, requireOrganizationAccess.
 *
 * @throws {BadRequestError} Si no hay organizationId en el contexto
 * @throws {ForbiddenError} Si no hay suscripción activa
 */
export const requireActiveSubscription = async (req, _res, next) => {
    const organizationId = getOrganizationId(req);
    if (!organizationId) {
        throw new BadRequestError('organizationId es requerido para validar suscripción');
    }
    await assertActiveSubscription(organizationId);
    next();
};
/**
 * Middleware que verifica el límite de usuarios antes de operaciones.
 * Debe ejecutarse después de: authenticate, requireOrganizationAccess.
 *
 * @throws {BadRequestError} Si no hay organizationId en el contexto
 * @throws {NotFoundError} Si la organización no tiene suscripción activa
 * @throws {ValidationError} Si se excede el límite de usuarios
 */
export const requireUsersLimit = async (req, _res, next) => {
    const organizationId = getOrganizationId(req);
    if (!organizationId) {
        throw new BadRequestError('organizationId es requerido para validar límites');
    }
    await checkUsersLimit(organizationId);
    next();
};
/**
 * Middleware que verifica el límite de eventos antes de operaciones.
 * Debe ejecutarse después de: authenticate, requireOrganizationAccess.
 *
 * @throws {BadRequestError} Si no hay organizationId en el contexto
 * @throws {NotFoundError} Si la organización no tiene suscripción activa
 * @throws {ValidationError} Si se excede el límite de eventos
 */
export const requireEventosLimit = async (req, _res, next) => {
    const organizationId = getOrganizationId(req);
    if (!organizationId) {
        throw new BadRequestError('organizationId es requerido para validar límites');
    }
    await checkEventosLimit(organizationId);
    next();
};
/**
 * Middleware que verifica el límite de actividades antes de operaciones.
 * Debe ejecutarse después de: authenticate, requireOrganizationAccess.
 *
 * @throws {BadRequestError} Si no hay organizationId en el contexto
 * @throws {NotFoundError} Si la organización no tiene suscripción activa
 * @throws {ValidationError} Si se excede el límite de actividades
 */
export const requireActividadesLimit = async (req, _res, next) => {
    const organizationId = getOrganizationId(req);
    if (!organizationId) {
        throw new BadRequestError('organizationId es requerido para validar límites');
    }
    await checkActividadesLimit(organizationId);
    next();
};
/**
 * Middleware que obtiene límites y uso actual de la organización y los adjunta
 * a res.locals.subscriptionLimits para que las respuestas los incluyan.
 * No lanza error si no hay suscripción; simplemente no adjunta datos.
 *
 * Debe ejecutarse después de: authenticate, requireOrganizationAccess.
 * Los helpers sendSuccess y sendPaginated incluirán limits en la respuesta
 * cuando res.locals.subscriptionLimits esté definido.
 */
export const attachSubscriptionLimits = async (req, res, next) => {
    const organizationId = getOrganizationId(req);
    if (!organizationId) {
        next();
        return;
    }
    try {
        const limitsAndUsage = await getLimitsAndUsage(organizationId);
        if (limitsAndUsage) {
            res.locals[SUBSCRIPTION_LIMITS_LOCALS_KEY] = limitsAndUsage;
        }
    }
    catch {
        // No adjuntar límites si falla (ej. sin suscripción)
    }
    next();
};
//# sourceMappingURL=subscription-limits.middleware.js.map