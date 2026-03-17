import { Op } from 'sequelize';
import type { UUID } from '@/shared/database/types.js';
import { Area } from '@/modules/areas/models/area.model.js';
import { DependenciaMembership } from '@/modules/dependencias/models/dependencia-membership.model.js';
import { Subscription } from '@/modules/subscriptions/models/subscription.model.js';
import { SubscriptionPlan } from '@/modules/subscriptions/models/subscription-plan.model.js';
import { Membership } from '@/modules/users/models/membership.model.js';
import { EventoOperativo } from '@/modules/eventos/models/evento-operativo.model.js';
import { Actividad } from '@/modules/actividades/models/actividad.model.js';
import { PrestadorProfile } from '@/modules/prestadores/models/prestador-profile.model.js';
import { Activo } from '@/modules/activos/models/activo.model.js';
import {
  getPlanById,
  getFreePlan,
} from '@/modules/subscriptions/services/subscription-plan.service.js';
import { ValidationError, NotFoundError } from '@/shared/errors/index.js';

/** Límite de prestadores y activos en plan FREE (enforcement sin columna en plan). */
const FREE_PLAN_PRESTADORES_LIMIT = 1;
const FREE_PLAN_ACTIVOS_LIMIT = 1;
/** Límite de áreas por dependencia en plan FREE. */
const FREE_PLAN_AREAS_PER_DEPENDENCIA_LIMIT = 1;
/** Límite de dependencias con plan FREE por usuario (autoservicio). */
const FREE_PLAN_DEPENDENCIAS_PER_USER_LIMIT = 1;

const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing'] as const;

/** Estados de evento que cuentan para el límite (excluye cancelados) */
const EVENTO_STATUSES_COUNTED = ['programado', 'en_curso', 'completado'] as const;

export interface OrganizationLimits {
  maxUsers: number | null;
  maxEventos: number | null;
  maxActividades: number | null;
  maxOrganizations: number | null;
  /** Límite de áreas por dependencia (plan FREE o features.limits.areas). */
  maxAreas: number | null;
  /** Límite de prestadores (plan FREE o features.limits.prestadores). */
  maxPrestadores: number | null;
  /** Límite de activos (plan FREE o features.limits.activos). */
  maxActivos: number | null;
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
 * Obtiene la suscripción activa para un área (vía dependencia). Uso interno.
 *
 * @param areaId - ID del área (la suscripción está a nivel dependencia)
 * @returns Suscripción activa con plan, o null si no hay
 */
export const getActiveSubscriptionByOrganization = async (
  areaId: UUID
): Promise<(Subscription & { SubscriptionPlan?: SubscriptionPlan }) | null> => {
  const area = await Area.findByPk(areaId);
  if (!area) return null;
  const subscription = await Subscription.findOne({
    where: {
      dependenciaId: area.dependenciaId,
      status: { [Op.in]: ACTIVE_SUBSCRIPTION_STATUSES },
    },
    order: [['currentPeriodEnd', 'DESC']],
    include: [{ model: SubscriptionPlan, as: 'SubscriptionPlan' }],
  });
  return subscription;
};

/** Obtiene el límite de prestadores del plan (FREE = constante; otros = features.limits.prestadores). */
const getPrestadoresLimit = (plan: SubscriptionPlan): number | null => {
  if (plan.name === 'free') return FREE_PLAN_PRESTADORES_LIMIT;
  const limit = plan.features?.limits?.['prestadores'];
  return typeof limit === 'number' && limit >= 0 ? limit : null;
};

/** Obtiene el límite de activos del plan (FREE = constante; otros = features.limits.activos). */
const getActivosLimit = (plan: SubscriptionPlan): number | null => {
  if (plan.name === 'free') return FREE_PLAN_ACTIVOS_LIMIT;
  const limit = plan.features?.limits?.['activos'];
  return typeof limit === 'number' && limit >= 0 ? limit : null;
};

/** Obtiene el límite de áreas por dependencia (FREE = constante; otros = features.limits.areas). */
const getAreasLimitForPlan = (plan: SubscriptionPlan): number | null => {
  if (plan.name === 'free') return FREE_PLAN_AREAS_PER_DEPENDENCIA_LIMIT;
  const limit = plan.features?.limits?.['areas'];
  return typeof limit === 'number' && limit >= 0 ? limit : null;
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
    maxAreas: getAreasLimitForPlan(plan) ?? null,
    maxPrestadores: getPrestadoresLimit(plan) ?? null,
    maxActivos: getActivosLimit(plan) ?? null,
    planId: plan.id,
    planName: plan.name,
  };
};

/**
 * Obtiene el uso actual a nivel dependencia (usuarios, eventos, actividades en todas las áreas de la dependencia).
 *
 * @param areaId - ID del área (se resuelve dependencia y se cuentan todos los recursos de esa dependencia)
 * @param periodBounds - Opcional, para filtrar eventos por periodo
 */
export const getOrganizationUsage = async (
  areaId: UUID,
  periodBounds?: { periodStart: Date; periodEnd: Date }
): Promise<OrganizationUsage> => {
  const area = await Area.findByPk(areaId);
  if (!area) {
    return { usersCount: 0, eventosCount: 0, actividadesCount: 0 };
  }
  const dependenciaId = area.dependenciaId;

  const areasOfDep = await Area.findAll({
    where: { dependenciaId },
    attributes: ['id'],
  });
  const areaIds = areasOfDep.map((a) => a.id);

  const whereEventos: Record<string, unknown> = {
    areaId: { [Op.in]: areaIds },
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
        areaId: { [Op.in]: areaIds },
        status: 'activo',
      },
    }),
    EventoOperativo.count({
      where: whereEventos,
    }),
    Actividad.count({
      where: { areaId: { [Op.in]: areaIds }, active: true },
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
    maxAreas: getAreasLimitForPlan(plan) ?? null,
    maxPrestadores: getPrestadoresLimit(plan) ?? null,
    maxActivos: getActivosLimit(plan) ?? null,
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
      plan.name === 'free'
        ? `El plan gratuito permite hasta ${plan.maxUsers} usuarios. Actualiza tu plan para agregar más.`
        : `Has alcanzado el límite de usuarios del plan (${plan.maxUsers}). Considera actualizar tu plan.`,
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
      plan.name === 'free'
        ? 'El plan gratuito permite solo 1 evento por periodo. Actualiza tu plan para agregar más.'
        : `Has alcanzado el límite de eventos del plan en este periodo (${plan.maxEventos}). Considera actualizar tu plan.`,
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
      plan.name === 'free'
        ? 'El plan gratuito permite solo 1 actividad. Actualiza tu plan para agregar más.'
        : `Has alcanzado el límite de actividades del plan (${plan.maxActividades}). Considera actualizar tu plan.`,
      'maxActividades'
    );
  }
};

/**
 * Verifica el límite de prestadores. FREE = 1; planes de pago usan features.limits.prestadores si existe.
 *
 * @param areaId - ID del área (organizationId en API)
 * @throws {NotFoundError} Si no tiene suscripción activa
 * @throws {ValidationError} Si se excede el límite
 */
export const checkPrestadoresLimit = async (areaId: UUID): Promise<void> => {
  const subscription = await getActiveSubscriptionByOrganization(areaId);
  if (!subscription?.SubscriptionPlan) {
    throw new NotFoundError('Suscripción activa', { organizationId: areaId });
  }
  const plan = subscription.SubscriptionPlan;
  const limit = getPrestadoresLimit(plan);
  if (limit == null) return;

  const area = await Area.findByPk(areaId);
  if (!area) return;
  const count = await PrestadorProfile.count({
    where: { dependenciaId: area.dependenciaId },
  });
  if (count >= limit) {
    throw new ValidationError(
      plan.name === 'free'
        ? 'El plan gratuito permite solo 1 prestador. Actualiza tu plan para agregar más.'
        : `Has alcanzado el límite de prestadores del plan (${limit}). Considera actualizar tu plan.`,
      'maxPrestadores'
    );
  }
};

/**
 * Verifica el límite de activos. FREE = 1; planes de pago usan features.limits.activos si existe.
 *
 * @param areaId - ID del área (organizationId en API)
 * @throws {NotFoundError} Si no tiene suscripción activa
 * @throws {ValidationError} Si se excede el límite
 */
export const checkActivosLimit = async (areaId: UUID): Promise<void> => {
  const subscription = await getActiveSubscriptionByOrganization(areaId);
  if (!subscription?.SubscriptionPlan) {
    throw new NotFoundError('Suscripción activa', { organizationId: areaId });
  }
  const plan = subscription.SubscriptionPlan;
  const limit = getActivosLimit(plan);
  if (limit == null) return;

  const area = await Area.findByPk(areaId);
  if (!area) return;
  const count = await Activo.count({
    where: { dependenciaId: area.dependenciaId },
  });
  if (count >= limit) {
    throw new ValidationError(
      plan.name === 'free'
        ? 'El plan gratuito permite solo 1 activo. Actualiza tu plan para agregar más.'
        : `Has alcanzado el límite de activos del plan (${limit}). Considera actualizar tu plan.`,
      'maxActivos'
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

/**
 * Obtiene la suscripción activa de una dependencia (con plan).
 */
export const getActiveSubscriptionByDependencia = async (
  dependenciaId: UUID
): Promise<(Subscription & { SubscriptionPlan?: SubscriptionPlan }) | null> => {
  return Subscription.findOne({
    where: {
      dependenciaId,
      status: { [Op.in]: ACTIVE_SUBSCRIPTION_STATUSES },
    },
    order: [['currentPeriodEnd', 'DESC']],
    include: [{ model: SubscriptionPlan, as: 'SubscriptionPlan' }],
  });
};

/**
 * Verifica el límite de áreas por dependencia. FREE = 1; planes de pago usan features.limits.areas si existe.
 * Llamar antes de crear área bajo dependencia.
 */
export const checkAreasLimitForDependencia = async (dependenciaId: UUID): Promise<void> => {
  const subscription = await getActiveSubscriptionByDependencia(dependenciaId);
  if (!subscription?.SubscriptionPlan) {
    throw new NotFoundError('Suscripción activa', { dependenciaId });
  }
  const plan = subscription.SubscriptionPlan;
  const limit = getAreasLimitForPlan(plan);
  if (limit == null) return;

  const count = await Area.count({
    where: { dependenciaId },
  });
  if (count >= limit) {
    throw new ValidationError(
      plan.name === 'free'
        ? 'El plan gratuito permite solo 1 área por dependencia. Actualiza tu plan para agregar más áreas.'
        : `Has alcanzado el límite de áreas del plan (${limit}). Considera actualizar tu plan.`,
      'maxAreas'
    );
  }
};

/**
 * Verifica el límite de dependencias FREE por usuario (autoservicio).
 * FREE = 1 dependencia con plan free por usuario. Llamar antes de crear dependencia.
 */
export const checkDependenciasLimitForUser = async (userId: UUID): Promise<void> => {
  const memberships = await DependenciaMembership.findAll({
    where: { userId, status: 'activo' },
    attributes: ['dependenciaId'],
  });
  const dependenciaIds = memberships.map((m) => m.dependenciaId);
  if (dependenciaIds.length === 0) return;

  const freePlan = await getFreePlan();
  const count = await Subscription.count({
    where: {
      dependenciaId: { [Op.in]: dependenciaIds },
      planId: freePlan.id,
      status: { [Op.in]: ACTIVE_SUBSCRIPTION_STATUSES },
    },
  });

  if (count >= FREE_PLAN_DEPENDENCIAS_PER_USER_LIMIT) {
    throw new ValidationError(
      'El plan gratuito permite solo 1 dependencia. Actualiza tu plan para crear más dependencias.',
      'maxDependencias'
    );
  }
};
