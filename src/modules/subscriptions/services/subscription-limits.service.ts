import { Op } from 'sequelize';
import type { UUID } from '@/shared/database/types.js';
import { Subscription } from '@/modules/subscriptions/models/subscription.model.js';
import { SubscriptionPlan } from '@/modules/subscriptions/models/subscription-plan.model.js';
import { Membership } from '@/modules/users/models/membership.model.js';
import { EventoOperativo } from '@/modules/eventos/models/evento-operativo.model.js';
import { Actividad } from '@/modules/actividades/models/actividad.model.js';
import { getPlanById } from '@/modules/subscriptions/services/subscription-plan.service.js';
import { ValidationError, NotFoundError } from '@/shared/errors/index.js';

const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing'] as const;

/** Estados de evento que cuentan para el límite (excluye cancelados) */
const EVENTO_STATUSES_COUNTED = ['programado', 'en_curso', 'completado'] as const;

export interface OrganizationLimits {
  maxUsers: number | null;
  maxEventos: number | null;
  maxActividades: number | null;
  maxOrganizations: number | null;
  planId: UUID;
  planName: string;
}

export interface OrganizationUsage {
  usersCount: number;
  eventosCount: number;
  actividadesCount: number;
}

export interface LimitsAndUsage {
  limits: OrganizationLimits;
  usage: OrganizationUsage;
}

/**
 * Obtiene la suscripción activa de una organización (uso interno).
 * No valida acceso del usuario; para uso desde otros services.
 *
 * @param organizationId - ID de la organización
 * @returns Suscripción activa con plan, o null si no hay
 */
export const getActiveSubscriptionByOrganization = async (
  organizationId: UUID
): Promise<(Subscription & { SubscriptionPlan?: SubscriptionPlan }) | null> => {
  const subscription = await Subscription.findOne({
    where: {
      organizationId,
      status: { [Op.in]: ACTIVE_SUBSCRIPTION_STATUSES },
    },
    order: [['currentPeriodEnd', 'DESC']],
    include: [{ model: SubscriptionPlan, as: 'SubscriptionPlan' }],
  });

  return subscription;
};

/**
 * Obtiene los límites del plan actual de una organización.
 *
 * @param organizationId - ID de la organización
 * @returns Límites del plan o null si no tiene suscripción activa
 */
export const getOrganizationLimits = async (
  organizationId: UUID
): Promise<OrganizationLimits | null> => {
  const subscription = await getActiveSubscriptionByOrganization(organizationId);
  if (!subscription?.SubscriptionPlan) {
    return null;
  }

  const plan = subscription.SubscriptionPlan;
  return {
    maxUsers: plan.maxUsers,
    maxEventos: plan.maxEventos,
    maxActividades: plan.maxActividades,
    maxOrganizations: plan.maxOrganizations,
    planId: plan.id,
    planName: plan.name,
  };
};

/**
 * Obtiene el uso actual de una organización (usuarios, eventos, actividades).
 * Los eventos se cuentan en el periodo actual de facturación (para límite "por mes/período").
 *
 * @param organizationId - ID de la organización
 * @param periodStart - Inicio del periodo (opcional, para filtrar eventos)
 * @param periodEnd - Fin del periodo (opcional, para filtrar eventos)
 * @returns Conteos actuales
 */
export const getOrganizationUsage = async (
  organizationId: UUID,
  periodBounds?: { periodStart: Date; periodEnd: Date }
): Promise<OrganizationUsage> => {
  const whereEventos: Record<string, unknown> = {
    organizationId,
    status: { [Op.in]: EVENTO_STATUSES_COUNTED },
  };

  if (periodBounds) {
    const formatDateOnly = (d: Date): string => d.toISOString().slice(0, 10);
    const startStr = formatDateOnly(
      periodBounds.periodStart instanceof Date
        ? periodBounds.periodStart
        : new Date(periodBounds.periodStart)
    );
    const endStr = formatDateOnly(
      periodBounds.periodEnd instanceof Date
        ? periodBounds.periodEnd
        : new Date(periodBounds.periodEnd)
    );
    whereEventos['date'] = { [Op.between]: [startStr, endStr] };
  }

  const [usersCount, eventosCount, actividadesCount] = await Promise.all([
    Membership.count({
      where: {
        organizationId,
        status: 'activo',
      },
    }),
    EventoOperativo.count({
      where: whereEventos,
    }),
    Actividad.count({
      where: { organizationId, active: true },
    }),
  ]);

  return { usersCount, eventosCount, actividadesCount };
};

/**
 * Obtiene límites y uso actual de una organización.
 *
 * @param organizationId - ID de la organización
 * @returns Límites y uso, o null si no tiene suscripción activa
 */
export const getLimitsAndUsage = async (organizationId: UUID): Promise<LimitsAndUsage | null> => {
  const subscription = await getActiveSubscriptionByOrganization(organizationId);
  if (!subscription?.SubscriptionPlan) {
    return null;
  }

  const plan = subscription.SubscriptionPlan;
  const periodStart = subscription.currentPeriodStart;
  const periodEnd = subscription.currentPeriodEnd;

  const limits: OrganizationLimits = {
    maxUsers: plan.maxUsers,
    maxEventos: plan.maxEventos,
    maxActividades: plan.maxActividades,
    maxOrganizations: plan.maxOrganizations,
    planId: plan.id,
    planName: plan.name,
  };

  const usage = await getOrganizationUsage(organizationId, {
    periodStart,
    periodEnd,
  });

  return { limits, usage };
};

/**
 * Verifica que la organización no exceda el límite de usuarios.
 *
 * @param organizationId - ID de la organización
 * @param currentCount - Conteo actual (opcional, se calcula si no se pasa)
 * @throws {NotFoundError} Si no tiene suscripción activa
 * @throws {ValidationError} Si se excede el límite
 */
export const checkUsersLimit = async (
  organizationId: UUID,
  currentCount?: number
): Promise<void> => {
  const subscription = await getActiveSubscriptionByOrganization(organizationId);
  if (!subscription?.SubscriptionPlan) {
    throw new NotFoundError('Suscripción activa', { organizationId });
  }

  const plan = subscription.SubscriptionPlan;
  if (plan.maxUsers == null) {
    return; // Sin límite
  }

  const count = currentCount ?? (await getOrganizationUsage(organizationId)).usersCount;

  if (count >= plan.maxUsers) {
    throw new ValidationError(
      `Has alcanzado el límite de usuarios del plan (${plan.maxUsers}). Considera actualizar tu plan.`,
      'maxUsers'
    );
  }
};

/**
 * Verifica que la organización no exceda el límite de eventos en el periodo actual.
 *
 * @param organizationId - ID de la organización
 * @param currentCount - Conteo actual en el periodo (opcional, se calcula si no se pasa)
 * @throws {NotFoundError} Si no tiene suscripción activa
 * @throws {ValidationError} Si se excede el límite
 */
export const checkEventosLimit = async (
  organizationId: UUID,
  currentCount?: number
): Promise<void> => {
  const subscription = await getActiveSubscriptionByOrganization(organizationId);
  if (!subscription?.SubscriptionPlan) {
    throw new NotFoundError('Suscripción activa', { organizationId });
  }

  const plan = subscription.SubscriptionPlan;
  if (plan.maxEventos == null) {
    return; // Sin límite
  }

  const usage =
    currentCount !== undefined
      ? { eventosCount: currentCount }
      : await getOrganizationUsage(organizationId, {
          periodStart: subscription.currentPeriodStart,
          periodEnd: subscription.currentPeriodEnd,
        });

  if (usage.eventosCount >= plan.maxEventos) {
    throw new ValidationError(
      `Has alcanzado el límite de eventos del plan en este periodo (${plan.maxEventos}). Considera actualizar tu plan.`,
      'maxEventos'
    );
  }
};

/**
 * Verifica que la organización no exceda el límite de actividades.
 *
 * @param organizationId - ID de la organización
 * @param currentCount - Conteo actual (opcional, se calcula si no se pasa)
 * @throws {NotFoundError} Si no tiene suscripción activa
 * @throws {ValidationError} Si se excede el límite
 */
export const checkActividadesLimit = async (
  organizationId: UUID,
  currentCount?: number
): Promise<void> => {
  const subscription = await getActiveSubscriptionByOrganization(organizationId);
  if (!subscription?.SubscriptionPlan) {
    throw new NotFoundError('Suscripción activa', { organizationId });
  }

  const plan = subscription.SubscriptionPlan;
  if (plan.maxActividades == null) {
    return; // Sin límite
  }

  const count = currentCount ?? (await getOrganizationUsage(organizationId)).actividadesCount;

  if (count >= plan.maxActividades) {
    throw new ValidationError(
      `Has alcanzado el límite de actividades del plan (${plan.maxActividades}). Considera actualizar tu plan.`,
      'maxActividades'
    );
  }
};

/**
 * Verifica el límite de organizaciones para un plan.
 * Aplica cuando el plan tiene maxOrganizations (ej. capacidad del plan).
 *
 * @param planId - ID del plan
 * @throws {ValidationError} Si se excede el límite
 */
export const checkOrganizationsLimit = async (planId: UUID): Promise<void> => {
  const plan = await getPlanById(planId);
  if (plan.maxOrganizations == null) {
    return; // Sin límite
  }

  const count = await Subscription.count({
    where: {
      planId,
      status: { [Op.in]: ACTIVE_SUBSCRIPTION_STATUSES },
    },
  });

  if (count >= plan.maxOrganizations) {
    throw new ValidationError(
      `El plan ha alcanzado su capacidad máxima de organizaciones (${plan.maxOrganizations}).`,
      'maxOrganizations'
    );
  }
};
