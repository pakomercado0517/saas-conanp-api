import { Op, type Transaction } from 'sequelize';
import type { UUID, SubscriptionStatus, BillingCycle } from '@/shared/database/types.js';
import { Subscription } from '@/modules/subscriptions/models/subscription.model.js';
import { SubscriptionPlan } from '@/modules/subscriptions/models/subscription-plan.model.js';
import { Organization } from '@/modules/organizations/models/organization.model.js';
import { Membership } from '@/modules/users/models/membership.model.js';
import { EventoOperativo } from '@/modules/eventos/models/evento-operativo.model.js';
import { Actividad } from '@/modules/actividades/models/actividad.model.js';
import { assertCanAccessOrganization } from '@/modules/organizations/services/organization.service.js';
import { assertIsAdmin } from '@/modules/users/services/membership.service.js';
import {
  getPlanById,
  getPlanByStripePriceId,
  assertPlanExistsAndActive,
  getFreePlan,
} from '@/modules/subscriptions/services/subscription-plan.service.js';
import { sequelize } from '@/shared/database/index.js';
import { stripeClient, handleStripeError } from '@/shared/stripe/index.js';
import { ConflictError, NotFoundError, ValidationError } from '@/shared/errors/index.js';
import type { PaginationMeta } from '@/shared/responses/types.js';
import { logger } from '@/shared/logger/index.js';
import { cache } from '@/shared/cache/index.js';
import { CacheKeys } from '@/shared/cache/keys.js';
import type {
  CreateSubscriptionDTO,
  UpdateSubscriptionDTO,
  CancelSubscriptionDTO,
  ListSubscriptionsDTO,
} from '@/modules/subscriptions/validators/subscription.validator.js';
import type { DateTime } from 'luxon';

const ACTIVE_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ['active', 'trialing'];
const CANCELABLE_STATUSES: SubscriptionStatus[] = ['active', 'trialing', 'past_due', 'unpaid'];

/**
 * Invalida el caché de suscripción de una organización.
 * Se llama después de CREATE/UPDATE/DELETE de suscripciones.
 */
const invalidateSubscriptionCache = async (organizationId: UUID): Promise<void> => {
  const cacheKey = CacheKeys.activeSubscription(organizationId);
  await cache.del(cacheKey);
  logger.debug({ organizationId, cacheKey }, 'Caché de suscripción invalidado');
};

/**
 * Valida que la organización no tenga una suscripción activa.
 * Estados "activos" considerados: active, trialing.
 *
 * @param organizationId - ID de la organización
 * @throws {ConflictError} Si ya existe una suscripción activa
 */
export const assertNoActiveSubscription = async (organizationId: UUID): Promise<void> => {
  const existing = await Subscription.findOne({
    where: {
      organizationId,
      status: { [Op.in]: ACTIVE_SUBSCRIPTION_STATUSES },
    },
  });

  if (existing) {
    throw new ConflictError(
      'La organización ya tiene una suscripción activa. Debe cancelarla antes de crear una nueva.',
      { organizationId, subscriptionId: existing.id }
    );
  }
};

/**
 * Valida que la organización no tenga ninguna suscripción existente (incluye cancelada, incompleta).
 * Evita suscripciones duplicadas por organización (una org = una suscripción).
 *
 * @param organizationId - ID de la organización
 * @throws {ConflictError} Si ya existe una suscripción (cualquier estado)
 */
export const assertNoExistingSubscription = async (organizationId: UUID): Promise<void> => {
  const existing = await Subscription.findOne({
    where: { organizationId },
  });

  if (existing) {
    throw new ConflictError(
      existing.status === 'active' || existing.status === 'trialing'
        ? 'La organización ya tiene una suscripción activa. Debe cancelarla antes de crear una nueva.'
        : `La organización ya tiene una suscripción en estado '${existing.status}'. Para reactivar, cancele la actual primero o contacte soporte.`,
      { organizationId, subscriptionId: existing.id, status: existing.status }
    );
  }
};

/**
 * Obtiene el uso actual de una organización (usuarios, eventos, actividades).
 *
 * @param organizationId - ID de la organización
 * @returns Conteos de usuarios, eventos y actividades
 */
export const getOrganizationUsage = async (
  organizationId: UUID
): Promise<{
  usersCount: number;
  eventosCount: number;
  actividadesCount: number;
}> => {
  const [usersCount, eventosCount, actividadesCount] = await Promise.all([
    Membership.count({
      where: {
        organizationId,
        status: 'activo',
      },
    }),
    EventoOperativo.count({
      where: { organizationId },
    }),
    Actividad.count({
      where: { organizationId, active: true },
    }),
  ]);

  return { usersCount, eventosCount, actividadesCount };
};

/**
 * Valida que la organización no exceda los límites del plan.
 *
 * @param planId - ID del plan
 * @param organizationId - ID de la organización
 * @throws {ValidationError} Si se exceden los límites
 */
export const assertPlanLimits = async (planId: UUID, organizationId: UUID): Promise<void> => {
  const plan = await getPlanById(planId);
  const usage = await getOrganizationUsage(organizationId);

  if (plan.maxUsers != null && usage.usersCount >= plan.maxUsers) {
    throw new ValidationError(
      `Has alcanzado el límite de usuarios del plan (${plan.maxUsers}). Considera actualizar tu plan.`,
      'maxUsers'
    );
  }

  if (plan.maxEventos != null && usage.eventosCount >= plan.maxEventos) {
    throw new ValidationError(
      `Has alcanzado el límite de eventos del plan (${plan.maxEventos}). Considera actualizar tu plan.`,
      'maxEventos'
    );
  }

  if (plan.maxActividades != null && usage.actividadesCount >= plan.maxActividades) {
    throw new ValidationError(
      `Has alcanzado el límite de actividades del plan (${plan.maxActividades}). Considera actualizar tu plan.`,
      'maxActividades'
    );
  }
};

/**
 * Obtiene o crea un Stripe Customer para la organización.
 *
 * @param organizationId - ID de la organización
 * @param organizationName - Nombre de la organización (para metadata)
 * @param existingStripeCustomerId - Si ya existe customer de otra suscripción
 * @returns stripeCustomerId
 */
const getOrCreateStripeCustomer = async (
  organizationId: UUID,
  organizationName: string,
  existingStripeCustomerId: string | null
): Promise<string> => {
  if (existingStripeCustomerId) {
    return existingStripeCustomerId;
  }

  const customer = await stripeClient.customers.create({
    name: organizationName,
    metadata: {
      organizationId,
    },
  });
  return customer.id;
};

/**
 * Convierte DateTime de Luxon a timestamp Unix para Stripe.
 */
const toStripeTimestamp = (dt: DateTime | Date | undefined): number | undefined => {
  if (!dt) return undefined;
  const date = dt instanceof Date ? dt : dt.toJSDate();
  return Math.floor(date.getTime() / 1000);
};

/**
 * Crea una suscripción en Stripe.
 *
 * @param data - Datos para crear la suscripción
 * @param organizationId - ID de la organización (multi-tenant)
 * @param stripeCustomerId - ID del cliente en Stripe
 * @returns Objeto con la suscripción de Stripe y datos mapeados
 */
export const createSubscriptionInStripe = async (
  data: CreateSubscriptionDTO,
  organizationId: UUID,
  stripeCustomerId: string
): Promise<{
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd: Date | null;
}> => {
  const plan = await getPlanById(data.planId);
  const stripePriceId =
    data.billingCycle === 'monthly' ? plan.stripePriceIdMonthly : plan.stripePriceIdYearly;

  if (!stripePriceId) {
    throw new ValidationError(
      `El plan no tiene precio de Stripe configurado para el ciclo ${data.billingCycle}. Sincroniza el plan con Stripe primero.`,
      'stripePriceId'
    );
  }

  const trialEndUnix = toStripeTimestamp(data.trialEnd);

  try {
    const subscription = await stripeClient.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: stripePriceId }],
      payment_behavior: 'default_incomplete',
      metadata: {
        organizationId,
        planId: data.planId,
      },
      ...(data.paymentMethodId && {
        default_payment_method: data.paymentMethodId,
      }),
      ...(trialEndUnix && { trial_end: trialEndUnix }),
    });

    const stripeData = subscription as unknown as Record<string, unknown>;
    const statusMap: Record<string, SubscriptionStatus> = {
      active: 'active',
      trialing: 'trialing',
      past_due: 'past_due',
      unpaid: 'unpaid',
      incomplete: 'incomplete',
      incomplete_expired: 'incomplete_expired',
      canceled: 'canceled',
    };
    const status = statusMap[(stripeData['status'] as string) ?? ''] ?? 'incomplete';

    const periodStart = stripeData['current_period_start'] as number | undefined;
    const periodEnd = stripeData['current_period_end'] as number | undefined;
    const trialEndStripe = stripeData['trial_end'] as number | null | undefined;
    const currentPeriodStart = periodStart != null ? new Date(periodStart * 1000) : new Date();
    const currentPeriodEnd =
      periodEnd != null
        ? new Date(periodEnd * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const trialEnd = trialEndStripe != null ? new Date(trialEndStripe * 1000) : null;

    const customer = stripeData['customer'];
    const resolvedCustomerId =
      typeof customer === 'string' ? customer : (customer as { id: string }).id;

    return {
      stripeSubscriptionId: stripeData['id'] as string,
      stripeCustomerId: resolvedCustomerId,
      stripePriceId,
      status,
      currentPeriodStart,
      currentPeriodEnd,
      trialEnd,
    };
  } catch (error) {
    handleStripeError(error);
    throw error;
  }
};

/**
 * Crea o actualiza una suscripción en la base de datos.
 *
 * @param data - Datos de la suscripción (provenientes de Stripe o manual)
 * @param transaction - Transacción opcional
 * @returns Suscripción creada o actualizada
 */
export const createSubscriptionInDatabase = async (
  data: {
    organizationId: UUID;
    planId: UUID;
    status: SubscriptionStatus;
    billingCycle: BillingCycle;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd?: boolean;
    stripeSubscriptionId?: string | null;
    stripeCustomerId?: string | null;
    stripePriceId?: string | null;
    trialEnd?: Date | null;
    metadata?: Record<string, unknown> | null;
  },
  transaction?: Transaction
): Promise<Subscription> => {
  const subscription = await Subscription.create(
    {
      organizationId: data.organizationId,
      planId: data.planId,
      status: data.status,
      billingCycle: data.billingCycle,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
      stripeSubscriptionId: data.stripeSubscriptionId ?? null,
      stripeCustomerId: data.stripeCustomerId ?? null,
      stripePriceId: data.stripePriceId ?? null,
      trialEnd: data.trialEnd ?? null,
      metadata: data.metadata ?? null,
    },
    transaction ? { transaction } : {}
  );

  logger.info(
    {
      subscriptionId: subscription.id,
      organizationId: data.organizationId,
      planId: data.planId,
      status: data.status,
    },
    'Suscripción creada en base de datos'
  );

  return subscription;
};

/**
 * Crea una suscripción FREE para una organización (sin Stripe).
 * Usado al crear una organización por super admin para que tenga suscripción activa
 * desde el inicio y el primer admin invitado pueda registrarse.
 *
 * @param organizationId - ID de la organización
 * @param transaction - Transacción opcional (ej. la de creación de la org)
 * @returns Suscripción creada con plan "free"
 * @throws {NotFoundError} Si no existe el plan "free"
 * @throws {ConflictError} Si la organización ya tiene suscripción
 */
export const createFreeSubscriptionForOrganization = async (
  organizationId: UUID,
  transaction?: Transaction
): Promise<Subscription> => {
  await assertNoExistingSubscription(organizationId);

  const plan = await getFreePlan(transaction);

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setFullYear(periodEnd.getFullYear() + 1);

  const subscription = await createSubscriptionInDatabase(
    {
      organizationId,
      planId: plan.id,
      status: 'active',
      billingCycle: 'monthly',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      stripeSubscriptionId: null,
      stripeCustomerId: null,
      stripePriceId: null,
    },
    transaction
  );

  await invalidateSubscriptionCache(organizationId);

  logger.info(
    { subscriptionId: subscription.id, organizationId, planId: plan.id },
    'Suscripción FREE creada para organización'
  );

  return subscription;
};

/**
 * Crea una suscripción completa: Stripe + base de datos.
 *
 * @param data - Datos para crear la suscripción
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario que crea (para validar acceso)
 * @returns Suscripción creada con relaciones
 */
export const createSubscription = async (
  data: CreateSubscriptionDTO,
  organizationId: UUID,
  userId: UUID
): Promise<Subscription> => {
  await assertIsAdmin(userId, organizationId);
  await assertNoExistingSubscription(organizationId);
  await assertPlanExistsAndActive(data.planId);
  await assertPlanLimits(data.planId, organizationId);

  const org = await Organization.findByPk(organizationId);
  if (!org) {
    throw new NotFoundError('Organización', { organizationId });
  }

  const existingSubscription = await Subscription.findOne({
    where: { organizationId },
    order: [['createdAt', 'DESC']],
  });
  const existingStripeCustomerId = existingSubscription?.stripeCustomerId ?? null;

  const stripeCustomerId = await getOrCreateStripeCustomer(
    organizationId,
    org.name,
    existingStripeCustomerId
  );

  const stripeResult = await createSubscriptionInStripe(data, organizationId, stripeCustomerId);

  const subscription = await createSubscriptionInDatabase({
    organizationId,
    planId: data.planId,
    status: stripeResult.status,
    billingCycle: data.billingCycle,
    currentPeriodStart: stripeResult.currentPeriodStart,
    currentPeriodEnd: stripeResult.currentPeriodEnd,
    stripeSubscriptionId: stripeResult.stripeSubscriptionId,
    stripeCustomerId: stripeResult.stripeCustomerId,
    stripePriceId: stripeResult.stripePriceId,
    trialEnd: stripeResult.trialEnd,
  });

  // Invalidar caché después de crear suscripción
  await invalidateSubscriptionCache(organizationId);

  return subscription.reload({
    include: [
      { model: Organization, as: 'Organization' },
      { model: SubscriptionPlan, as: 'SubscriptionPlan' },
    ],
  });
};

/**
 * Obtiene la suscripción actual de una organización.
 * Filtro multi-tenant obligatorio.
 *
 * @param organizationId - ID de la organización
 * @param userId - ID del usuario (para validar acceso)
 * @returns Suscripción actual o null
 */
export const getSubscriptionByOrganization = async (
  organizationId: UUID,
  userId: UUID
): Promise<Subscription | null> => {
  await assertIsAdmin(userId, organizationId);

  const subscription = await Subscription.findOne({
    where: {
      organizationId, // Multi-tenant obligatorio
      status: { [Op.in]: [...ACTIVE_SUBSCRIPTION_STATUSES, 'canceled'] },
    },
    order: [['currentPeriodEnd', 'DESC']],
    include: [
      { model: Organization, as: 'Organization' },
      { model: SubscriptionPlan, as: 'SubscriptionPlan' },
    ],
  });

  return subscription;
};

/**
 * Obtiene una suscripción por ID y valida que el usuario tenga acceso a la organización.
 * Usado para rutas que solo tienen subscriptionId en el path.
 *
 * @param subscriptionId - ID de la suscripción
 * @param userId - ID del usuario
 * @returns Suscripción encontrada
 */
export const getSubscriptionById = async (
  subscriptionId: UUID,
  userId: UUID
): Promise<Subscription> => {
  const subscription = await Subscription.findOne({
    where: { id: subscriptionId },
    include: [
      { model: Organization, as: 'Organization' },
      { model: SubscriptionPlan, as: 'SubscriptionPlan' },
    ],
  });

  if (!subscription) {
    throw new NotFoundError('Suscripción', { subscriptionId });
  }

  await assertIsAdmin(userId, subscription.organizationId);
  return subscription;
};

/**
 * Obtiene el historial de facturación (invoices) de una suscripción desde Stripe.
 *
 * @param subscriptionId - ID de la suscripción
 * @param userId - ID del usuario
 * @param page - Página (default 1)
 * @param limit - Límite por página (default 20, max 100)
 * @returns Lista paginada de facturas
 */
export const getBillingHistory = async (
  subscriptionId: UUID,
  userId: UUID,
  page: number = 1,
  limit: number = 20
): Promise<{
  data: Array<{
    id: string;
    number: string | null;
    status: string;
    amountDue: number;
    amountPaid: number;
    currency: string;
    created: number;
    invoicePdf: string | null;
    hostedInvoiceUrl: string | null;
  }>;
  pagination: PaginationMeta;
}> => {
  const subscription = await getSubscriptionById(subscriptionId, userId);

  if (!subscription.stripeSubscriptionId) {
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }

  const safeLimit = Math.min(Math.max(limit, 1), 100);

  try {
    const invoices = await stripeClient.invoices.list({
      subscription: subscription.stripeSubscriptionId,
      limit: safeLimit,
    });

    const data = (invoices.data ?? []).map((inv) => ({
      id: inv.id,
      number: inv.number ?? null,
      status: inv.status ?? 'unknown',
      amountDue: inv.amount_due ?? 0,
      amountPaid: inv.amount_paid ?? 0,
      currency: (inv.currency ?? 'mxn').toUpperCase(),
      created: inv.created ?? 0,
      invoicePdf: inv.invoice_pdf ?? null,
      hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
    }));

    const total = invoices.data?.length ?? 0;
    const totalPages = invoices.has_more ? page + 1 : Math.max(1, Math.ceil(total / safeLimit));

    return {
      data,
      pagination: {
        page,
        limit: safeLimit,
        total,
        totalPages,
      },
    };
  } catch (error) {
    handleStripeError(error);
    throw error;
  }
};

/**
 * Cambia el plan de una suscripción (upgrade/downgrade).
 *
 * @param subscriptionId - ID de la suscripción
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario
 * @param data - Datos del cambio (planId, billingCycle, prorate)
 * @returns Suscripción actualizada
 */
export const changePlan = async (
  subscriptionId: UUID,
  organizationId: UUID,
  userId: UUID,
  data: UpdateSubscriptionDTO
): Promise<Subscription> => {
  await assertIsAdmin(userId, organizationId);

  const subscription = await Subscription.findOne({
    where: {
      id: subscriptionId,
      organizationId, // Multi-tenant obligatorio
    },
    include: [
      { model: Organization, as: 'Organization' },
      { model: SubscriptionPlan, as: 'SubscriptionPlan' },
    ],
  });

  if (!subscription) {
    throw new NotFoundError('Suscripción', { subscriptionId, organizationId });
  }

  if (!ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) {
    throw new ValidationError(
      `No se puede cambiar el plan de una suscripción en estado '${subscription.status}'. La suscripción debe estar activa o en período de prueba.`,
      'status'
    );
  }

  const planId = data.planId ?? subscription.planId;
  const billingCycle = data.billingCycle ?? subscription.billingCycle;

  await assertPlanExistsAndActive(planId);
  await assertPlanLimits(planId, organizationId);

  const plan = await getPlanById(planId);
  const stripePriceId =
    billingCycle === 'monthly' ? plan.stripePriceIdMonthly : plan.stripePriceIdYearly;

  if (!stripePriceId) {
    throw new ValidationError(
      `El plan no tiene precio de Stripe configurado para el ciclo ${billingCycle}.`,
      'stripePriceId'
    );
  }

  if (!subscription.stripeSubscriptionId) {
    throw new ValidationError(
      'La suscripción no está vinculada a Stripe. No se puede cambiar el plan.',
      'stripeSubscriptionId'
    );
  }

  const prorationBehavior = data.prorate === false ? 'none' : 'create_prorations';

  try {
    const stripeSubscription = await stripeClient.subscriptions.retrieve(
      subscription.stripeSubscriptionId,
      { expand: ['items.data.price'] }
    );
    const subscriptionItemId = stripeSubscription.items.data[0]?.id;

    if (!subscriptionItemId) {
      throw new ValidationError(
        'No se encontró el item de suscripción en Stripe',
        'subscriptionItemId'
      );
    }

    await stripeClient.subscriptions.update(subscription.stripeSubscriptionId, {
      items: [
        {
          id: subscriptionItemId,
          price: stripePriceId,
        },
      ],
      proration_behavior: prorationBehavior,
      metadata: {
        organizationId,
        planId,
      },
    });
  } catch (error) {
    handleStripeError(error);
    throw error;
  }

  await subscription.update({
    planId,
    billingCycle,
    stripePriceId,
  });

  // Invalidar caché después de cambiar plan
  await invalidateSubscriptionCache(organizationId);

  logger.info(
    { subscriptionId, organizationId, planId, billingCycle },
    'Plan de suscripción actualizado'
  );

  return subscription.reload({
    include: [
      { model: Organization, as: 'Organization' },
      { model: SubscriptionPlan, as: 'SubscriptionPlan' },
    ],
  });
};

/**
 * Cancela una suscripción.
 *
 * @param subscriptionId - ID de la suscripción
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario
 * @param data - Opciones de cancelación
 * @returns Suscripción actualizada
 */
export const cancelSubscription = async (
  subscriptionId: UUID,
  organizationId: UUID,
  userId: UUID,
  data: CancelSubscriptionDTO
): Promise<Subscription> => {
  await assertIsAdmin(userId, organizationId);

  const subscription = await Subscription.findOne({
    where: {
      id: subscriptionId,
      organizationId, // Multi-tenant obligatorio
    },
    include: [
      { model: Organization, as: 'Organization' },
      { model: SubscriptionPlan, as: 'SubscriptionPlan' },
    ],
  });

  if (!subscription) {
    throw new NotFoundError('Suscripción', { subscriptionId, organizationId });
  }

  if (subscription.status === 'canceled') {
    throw new ValidationError('La suscripción ya está cancelada', 'status');
  }

  if (!CANCELABLE_STATUSES.includes(subscription.status)) {
    throw new ValidationError(
      `No se puede cancelar una suscripción en estado '${subscription.status}'. Solo se pueden cancelar suscripciones activas, en prueba, past_due o unpaid.`,
      'status'
    );
  }

  if (subscription.stripeSubscriptionId) {
    try {
      if (data.cancelAtPeriodEnd) {
        await stripeClient.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
          metadata: {
            ...((subscription.metadata as Record<string, unknown>) ?? {}),
            cancelReason: data.reason ?? '',
          },
        });
        await subscription.update({
          cancelAtPeriodEnd: true,
          metadata: {
            ...((subscription.metadata as Record<string, unknown>) ?? {}),
            cancelReason: data.reason ?? '',
          },
        });
      } else {
        await stripeClient.subscriptions.cancel(subscription.stripeSubscriptionId);
        await subscription.update({
          status: 'canceled',
          cancelAtPeriodEnd: false,
          canceledAt: new Date(),
        });
      }
    } catch (error) {
      handleStripeError(error);
      throw error;
    }
  } else {
    await subscription.update({
      status: 'canceled',
      cancelAtPeriodEnd: false,
      canceledAt: new Date(),
    });
  }

  logger.info(
    {
      subscriptionId,
      organizationId,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd,
      reason: data.reason,
    },
    'Suscripción cancelada'
  );

  // Invalidar caché después de cancelar suscripción
  await invalidateSubscriptionCache(organizationId);

  return subscription.reload({
    include: [
      { model: Organization, as: 'Organization' },
      { model: SubscriptionPlan, as: 'SubscriptionPlan' },
    ],
  });
};

/**
 * Reactiva una suscripción cancelada (quita cancel_at_period_end).
 *
 * @param subscriptionId - ID de la suscripción
 * @param organizationId - ID de la organización (multi-tenant)
 * @param userId - ID del usuario
 * @returns Suscripción actualizada
 */
export const reactivateSubscription = async (
  subscriptionId: UUID,
  organizationId: UUID,
  userId: UUID
): Promise<Subscription> => {
  await assertIsAdmin(userId, organizationId);

  const subscription = await Subscription.findOne({
    where: {
      id: subscriptionId,
      organizationId, // Multi-tenant obligatorio
    },
    include: [
      { model: Organization, as: 'Organization' },
      { model: SubscriptionPlan, as: 'SubscriptionPlan' },
    ],
  });

  if (!subscription) {
    throw new NotFoundError('Suscripción', { subscriptionId, organizationId });
  }

  if (!subscription.cancelAtPeriodEnd) {
    throw new ValidationError(
      'La suscripción no está programada para cancelarse al final del período. No hay nada que reactivar.',
      'cancelAtPeriodEnd'
    );
  }

  if (subscription.stripeSubscriptionId) {
    try {
      await stripeClient.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });
    } catch (error) {
      handleStripeError(error);
      throw error;
    }
  }

  await subscription.update({ cancelAtPeriodEnd: false });

  // Invalidar caché después de reactivar suscripción
  await invalidateSubscriptionCache(organizationId);

  logger.info({ subscriptionId, organizationId }, 'Suscripción reactivada');

  return subscription.reload({
    include: [
      { model: Organization, as: 'Organization' },
      { model: SubscriptionPlan, as: 'SubscriptionPlan' },
    ],
  });
};

/**
 * Crea o actualiza una suscripción en BD desde el webhook customer.subscription.created.
 * Idempotente: si ya existe por stripeSubscriptionId, actualiza y retorna.
 *
 * @param stripeSubscription - Objeto subscription de Stripe (event.data.object)
 * @returns Suscripción creada/actualizada o null si falta organización o no existe
 */
export const createSubscriptionFromWebhook = async (
  stripeSubscription: Record<string, unknown>
): Promise<Subscription | null> => {
  const stripeSubscriptionId = stripeSubscription['id'] as string | undefined;
  if (!stripeSubscriptionId) return null;

  const metadata = stripeSubscription['metadata'] as Record<string, string> | undefined;
  const organizationId = metadata?.['organizationId'] as UUID | undefined;
  const metadataPlanId = metadata?.['planId'] as UUID | undefined;

  const items = stripeSubscription['items'] as
    | { data?: Array<{ price?: { id?: string } }> }
    | undefined;
  const priceId = items?.data?.[0]?.price?.id as string | undefined;

  if (!organizationId) {
    logger.warn(
      { stripeSubscriptionId, metadata },
      'Webhook subscription.created: metadata.organizationId ausente'
    );
    return null;
  }

  const org = await Organization.findByPk(organizationId);
  if (!org) {
    logger.warn(
      { organizationId, stripeSubscriptionId },
      'Webhook subscription.created: organización no encontrada'
    );
    return null;
  }

  let planId: UUID;
  let billingCycle: BillingCycle;

  if (metadataPlanId) {
    try {
      const plan = await getPlanById(metadataPlanId);
      planId = plan.id;
      billingCycle =
        priceId === plan.stripePriceIdMonthly
          ? 'monthly'
          : priceId === plan.stripePriceIdYearly
            ? 'yearly'
            : 'monthly';
    } catch {
      if (!priceId) {
        logger.warn(
          { stripeSubscriptionId, metadataPlanId },
          'Webhook subscription.created: planId en metadata inválido y sin priceId'
        );
        return null;
      }
      try {
        const plan = await getPlanByStripePriceId(priceId);
        planId = plan.id;
        billingCycle = priceId === plan.stripePriceIdMonthly ? 'monthly' : 'yearly';
      } catch {
        logger.warn(
          { stripeSubscriptionId, priceId },
          'Webhook subscription.created: plan no encontrado por priceId'
        );
        return null;
      }
    }
  } else {
    if (!priceId) {
      logger.warn(
        { stripeSubscriptionId },
        'Webhook subscription.created: sin metadata.planId ni priceId'
      );
      return null;
    }
    try {
      const plan = await getPlanByStripePriceId(priceId);
      planId = plan.id;
      billingCycle = priceId === plan.stripePriceIdMonthly ? 'monthly' : 'yearly';
    } catch {
      logger.warn(
        { stripeSubscriptionId, priceId },
        'Webhook subscription.created: plan no encontrado por priceId'
      );
      return null;
    }
  }

  const statusMap: Record<string, SubscriptionStatus> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    unpaid: 'unpaid',
    incomplete: 'incomplete',
    incomplete_expired: 'incomplete_expired',
    canceled: 'canceled',
  };
  const stripeStatus = stripeSubscription['status'] as string | undefined;
  const status = stripeStatus ? (statusMap[stripeStatus] ?? 'incomplete') : 'incomplete';

  const periodStart = stripeSubscription['current_period_start'] as number | undefined;
  const periodEnd = stripeSubscription['current_period_end'] as number | undefined;
  const currentPeriodStart = periodStart != null ? new Date(periodStart * 1000) : new Date();
  const currentPeriodEnd =
    periodEnd != null
      ? new Date(periodEnd * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const customer = stripeSubscription['customer'];
  const stripeCustomerId =
    typeof customer === 'string' ? customer : ((customer as { id: string })?.id ?? null);

  const trialEndStripe = stripeSubscription['trial_end'] as number | null | undefined;
  const trialEnd = trialEndStripe != null ? new Date(trialEndStripe * 1000) : null;

  const cancelAtPeriodEnd = (stripeSubscription['cancel_at_period_end'] as boolean) ?? false;
  const canceledAtStripe = stripeSubscription['canceled_at'] as number | null | undefined;
  const canceledAt = canceledAtStripe != null ? new Date(canceledAtStripe * 1000) : null;

  const existing = await Subscription.findOne({
    where: { stripeSubscriptionId },
    include: [
      { model: Organization, as: 'Organization' },
      { model: SubscriptionPlan, as: 'SubscriptionPlan' },
    ],
  });

  if (existing) {
    return updateSubscriptionFromWebhook(stripeSubscription);
  }

  const transaction = await sequelize.transaction();
  try {
    const subscription = await createSubscriptionInDatabase(
      {
        organizationId,
        planId,
        status,
        billingCycle,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd,
        stripeSubscriptionId,
        stripeCustomerId,
        stripePriceId: priceId ?? null,
        trialEnd,
      },
      transaction
    );
    if (status === 'canceled' && canceledAt) {
      await subscription.update({ canceledAt }, { transaction });
    }
    await transaction.commit();
    logger.info(
      {
        subscriptionId: subscription.id,
        stripeSubscriptionId,
        organizationId,
        planId,
        status,
      },
      'Webhook subscription.created: suscripción creada en BD'
    );
    return subscription.reload({
      include: [
        { model: Organization, as: 'Organization' },
        { model: SubscriptionPlan, as: 'SubscriptionPlan' },
      ],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Actualiza el estado de una suscripción desde un webhook de Stripe.
 * NO valida acceso a organización (se llama desde Stripe).
 *
 * @param stripeSubscription - Objeto subscription de Stripe (event.data.object)
 * @returns Suscripción actualizada o null si no existe
 */
export const updateSubscriptionFromWebhook = async (
  stripeSubscription: Record<string, unknown>
): Promise<Subscription | null> => {
  const stripeSubscriptionId = stripeSubscription['id'] as string | undefined;
  if (!stripeSubscriptionId) return null;

  const subscription = await Subscription.findOne({
    where: { stripeSubscriptionId },
    include: [
      { model: Organization, as: 'Organization' },
      { model: SubscriptionPlan, as: 'SubscriptionPlan' },
    ],
  });

  if (!subscription) {
    logger.warn({ stripeSubscriptionId }, 'Webhook: suscripción no encontrada en BD');
    return null;
  }

  const statusMap: Record<string, SubscriptionStatus> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    unpaid: 'unpaid',
    incomplete: 'incomplete',
    incomplete_expired: 'incomplete_expired',
    canceled: 'canceled',
  };
  const stripeStatus = stripeSubscription['status'] as string | undefined;
  const newStatus = stripeStatus ? statusMap[stripeStatus] : undefined;

  const currentPeriodStart = stripeSubscription['current_period_start'];
  const currentPeriodEnd = stripeSubscription['current_period_end'];
  const cancelAtPeriodEnd = stripeSubscription['cancel_at_period_end'] as boolean | undefined;
  const canceledAt = stripeSubscription['canceled_at'] as number | null | undefined;
  const trialEnd = stripeSubscription['trial_end'] as number | null | undefined;

  const items = stripeSubscription['items'] as
    | { data?: Array<{ price?: { id?: string } }> }
    | undefined;
  const priceId = items?.data?.[0]?.price?.id;

  const updateData: Record<string, unknown> = {};

  if (newStatus) updateData['status'] = newStatus;
  if (typeof currentPeriodStart === 'number') {
    updateData['currentPeriodStart'] = new Date(currentPeriodStart * 1000);
  }
  if (typeof currentPeriodEnd === 'number') {
    updateData['currentPeriodEnd'] = new Date(currentPeriodEnd * 1000);
  }
  if (cancelAtPeriodEnd !== undefined) updateData['cancelAtPeriodEnd'] = cancelAtPeriodEnd;
  if (canceledAt != null) updateData['canceledAt'] = new Date(canceledAt * 1000);
  if (trialEnd != null) updateData['trialEnd'] = new Date(trialEnd * 1000);
  if (priceId) updateData['stripePriceId'] = priceId;

  if (Object.keys(updateData).length > 0) {
    await subscription.update(updateData);

    // Invalidar caché después de actualizar desde webhook
    await invalidateSubscriptionCache(subscription.organizationId);

    logger.info(
      {
        subscriptionId: subscription.id,
        stripeSubscriptionId,
        updates: Object.keys(updateData),
      },
      'Suscripción actualizada desde webhook'
    );
  }

  return subscription.reload({
    include: [
      { model: Organization, as: 'Organization' },
      { model: SubscriptionPlan, as: 'SubscriptionPlan' },
    ],
  });
};

/**
 * Renueva el período de suscripción desde invoice.payment_succeeded.
 * Solo actúa cuando billing_reason === 'subscription_cycle'.
 *
 * @param stripeInvoice - Objeto invoice de Stripe (event.data.object)
 * @returns Suscripción actualizada o null
 */
export const renewSubscriptionPeriodFromWebhook = async (
  stripeInvoice: Record<string, unknown>
): Promise<Subscription | null> => {
  const billingReason = stripeInvoice['billing_reason'] as string | undefined;
  if (billingReason !== 'subscription_cycle') {
    return null;
  }

  const subscriptionId = stripeInvoice['subscription'];
  const stripeSubscriptionId =
    typeof subscriptionId === 'string' ? subscriptionId : (subscriptionId as { id?: string })?.id;
  if (!stripeSubscriptionId) return null;

  const subscription = await Subscription.findOne({
    where: { stripeSubscriptionId },
    include: [
      { model: Organization, as: 'Organization' },
      { model: SubscriptionPlan, as: 'SubscriptionPlan' },
    ],
  });

  if (!subscription) {
    logger.warn(
      { stripeSubscriptionId },
      'Webhook invoice.payment_succeeded: suscripción no encontrada en BD'
    );
    return null;
  }

  const periodStart = stripeInvoice['period_start'] as number | undefined;
  const periodEnd = stripeInvoice['period_end'] as number | undefined;
  if (periodStart == null || periodEnd == null) return subscription;

  const updateData: Record<string, unknown> = {
    currentPeriodStart: new Date(periodStart * 1000),
    currentPeriodEnd: new Date(periodEnd * 1000),
  };
  if (subscription.status === 'past_due') {
    updateData['status'] = 'active';
  }
  await subscription.update(updateData);

  // Invalidar caché después de actualizar desde invoice
  await invalidateSubscriptionCache(subscription.organizationId);

  logger.info(
    {
      subscriptionId: subscription.id,
      stripeSubscriptionId,
      currentPeriodStart: updateData['currentPeriodStart'],
      currentPeriodEnd: updateData['currentPeriodEnd'],
    },
    'Webhook invoice.payment_succeeded: período de suscripción renovado'
  );

  return subscription.reload({
    include: [
      { model: Organization, as: 'Organization' },
      { model: SubscriptionPlan, as: 'SubscriptionPlan' },
    ],
  });
};

/**
 * Marca la suscripción como past_due desde invoice.payment_failed.
 *
 * @param stripeInvoice - Objeto invoice de Stripe (event.data.object)
 * @returns Suscripción actualizada o null
 */
export const markSubscriptionPastDueFromWebhook = async (
  stripeInvoice: Record<string, unknown>
): Promise<Subscription | null> => {
  const subscriptionId = stripeInvoice['subscription'];
  const stripeSubscriptionId =
    typeof subscriptionId === 'string' ? subscriptionId : (subscriptionId as { id?: string })?.id;
  if (!stripeSubscriptionId) return null;

  const subscription = await Subscription.findOne({
    where: { stripeSubscriptionId },
    include: [
      { model: Organization, as: 'Organization' },
      { model: SubscriptionPlan, as: 'SubscriptionPlan' },
    ],
  });

  if (!subscription) {
    logger.warn(
      { stripeSubscriptionId },
      'Webhook invoice.payment_failed: suscripción no encontrada en BD'
    );
    return null;
  }

  await subscription.update({ status: 'past_due' });

  // Invalidar caché después de marcar como past_due
  await invalidateSubscriptionCache(subscription.organizationId);

  logger.info(
    { subscriptionId: subscription.id, stripeSubscriptionId },
    'Webhook invoice.payment_failed: suscripción marcada past_due'
  );

  return subscription.reload({
    include: [
      { model: Organization, as: 'Organization' },
      { model: SubscriptionPlan, as: 'SubscriptionPlan' },
    ],
  });
};

/**
 * Maneja customer.subscription.trial_will_end: log para auditoría y punto de extensión
 * para notificación (email/push) cuando exista el servicio.
 *
 * @param stripeSubscription - Objeto subscription de Stripe (event.data.object)
 */
export const handleTrialWillEndFromWebhook = async (
  stripeSubscription: Record<string, unknown>
): Promise<void> => {
  const stripeSubscriptionId = stripeSubscription['id'] as string | undefined;
  const trialEndStripe = stripeSubscription['trial_end'] as number | null | undefined;
  const metadata = stripeSubscription['metadata'] as Record<string, string> | undefined;
  const organizationId = metadata?.['organizationId'];

  let subscriptionOrganizationId: UUID | undefined;
  if (stripeSubscriptionId) {
    const sub = await Subscription.findOne({
      where: { stripeSubscriptionId },
      attributes: ['organizationId'],
    });
    subscriptionOrganizationId = sub?.organizationId;
  }

  const organizationIdResolved = organizationId ?? subscriptionOrganizationId;
  const trialEnd =
    trialEndStripe != null ? new Date(trialEndStripe * 1000).toISOString() : undefined;

  logger.info(
    {
      stripeSubscriptionId,
      trialEnd: trialEndStripe,
      trialEndDate: trialEnd,
      organizationId: organizationIdResolved,
    },
    'Webhook subscription.trial_will_end: fin de prueba próximo. Integrar notificación (email/push) cuando exista el servicio.'
  );
};

/**
 * Lista suscripciones con paginación y filtros.
 * Si se proporciona organizationId, aplica filtro multi-tenant obligatorio.
 *
 * @param filters - Filtros y paginación
 * @param userId - ID del usuario (para validar acceso cuando hay organizationId)
 * @param organizationId - Opcional. Si se proporciona, filtra por organización y valida acceso.
 * @returns Lista paginada de suscripciones
 */
export const listSubscriptions = async (
  filters: ListSubscriptionsDTO,
  userId: UUID,
  organizationId?: UUID
): Promise<{ data: Subscription[]; pagination: PaginationMeta }> => {
  const where: Record<string, unknown> = {};

  if (organizationId) {
    await assertCanAccessOrganization(userId, organizationId);
    where['organizationId'] = organizationId; // Multi-tenant obligatorio
  } else if (filters.organizationId) {
    await assertCanAccessOrganization(userId, filters.organizationId);
    where['organizationId'] = filters.organizationId;
  }

  if (filters.status) where['status'] = filters.status;
  if (filters.billingCycle) where['billingCycle'] = filters.billingCycle;
  if (filters.planId) where['planId'] = filters.planId;
  if (filters.organizationId) where['organizationId'] = filters.organizationId;

  const limit = filters.limit;
  const sortBy = filters.sortBy ?? 'createdAt';
  const sortOrder = filters.sortOrder ?? 'desc';
  const offset = (filters.page - 1) * limit;

  const result = await Subscription.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sortBy, sortOrder]],
    include: [
      { model: Organization, as: 'Organization' },
      { model: SubscriptionPlan, as: 'SubscriptionPlan' },
    ],
  });

  const total = result.count as number;
  const totalPages = Math.ceil(total / limit);
  const pagination: PaginationMeta = {
    page: filters.page,
    limit,
    total,
    totalPages,
  };

  return { data: result.rows, pagination };
};
