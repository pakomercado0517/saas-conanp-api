import type { Request, Response, NextFunction } from 'express';
import type { LimitsAndUsage } from '../../modules/subscriptions/services/subscription-limits.service.js';
/** Clave en res.locals para la información de límites */
export declare const SUBSCRIPTION_LIMITS_LOCALS_KEY: "subscriptionLimits";
/** Tipo de la información de límites en res.locals */
export type SubscriptionLimitsLocals = LimitsAndUsage;
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
export declare const requireActiveSubscription: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware que verifica el límite de usuarios antes de operaciones.
 * Debe ejecutarse después de: authenticate, requireOrganizationAccess.
 *
 * @throws {BadRequestError} Si no hay organizationId en el contexto
 * @throws {NotFoundError} Si la organización no tiene suscripción activa
 * @throws {ValidationError} Si se excede el límite de usuarios
 */
export declare const requireUsersLimit: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware que verifica el límite de eventos antes de operaciones.
 * Debe ejecutarse después de: authenticate, requireOrganizationAccess.
 *
 * @throws {BadRequestError} Si no hay organizationId en el contexto
 * @throws {NotFoundError} Si la organización no tiene suscripción activa
 * @throws {ValidationError} Si se excede el límite de eventos
 */
export declare const requireEventosLimit: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware que verifica el límite de actividades antes de operaciones.
 * Debe ejecutarse después de: authenticate, requireOrganizationAccess.
 *
 * @throws {BadRequestError} Si no hay organizationId en el contexto
 * @throws {NotFoundError} Si la organización no tiene suscripción activa
 * @throws {ValidationError} Si se excede el límite de actividades
 */
export declare const requireActividadesLimit: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware que obtiene límites y uso actual de la organización y los adjunta
 * a res.locals.subscriptionLimits para que las respuestas los incluyan.
 * No lanza error si no hay suscripción; simplemente no adjunta datos.
 *
 * Debe ejecutarse después de: authenticate, requireOrganizationAccess.
 * Los helpers sendSuccess y sendPaginated incluirán limits en la respuesta
 * cuando res.locals.subscriptionLimits esté definido.
 */
export declare const attachSubscriptionLimits: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=subscription-limits.middleware.d.ts.map