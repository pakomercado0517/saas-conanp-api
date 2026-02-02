import type { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '@/shared/errors/index.js';
import { assertActiveSubscription } from '@/modules/organizations/services/organization.service.js';
import {
  checkUsersLimit,
  checkEventosLimit,
  checkActividadesLimit,
  getLimitsAndUsage,
} from '@/modules/subscriptions/services/subscription-limits.service.js';
import type { LimitsAndUsage } from '@/modules/subscriptions/services/subscription-limits.service.js';

/** Clave en res.locals para la información de límites */
export const SUBSCRIPTION_LIMITS_LOCALS_KEY = 'subscriptionLimits' as const;

/** Tipo de la información de límites en res.locals */
export type SubscriptionLimitsLocals = LimitsAndUsage;

/**
 * Obtiene organizationId del request.
 * Debe ejecutarse después de requireOrganizationAccess.
 */
const getOrganizationId = (req: Request): string | undefined => {
  return req.organizationId ?? (req.params['organizationId'] as string | undefined);
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
export const requireActiveSubscription = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
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
export const requireUsersLimit = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
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
export const requireEventosLimit = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
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
export const requireActividadesLimit = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
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
export const attachSubscriptionLimits = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
  } catch {
    // No adjuntar límites si falla (ej. sin suscripción)
  }

  next();
};
