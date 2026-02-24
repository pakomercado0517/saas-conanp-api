import type { UUID } from '@/shared/database/types.js';
import { Subscription } from '@/modules/subscriptions/models/subscription.model.js';
import { SubscriptionPlan } from '@/modules/subscriptions/models/subscription-plan.model.js';
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
 * Obtiene la suscripción activa para un área (vía dependencia). Uso interno.
 *
 * @param areaId - ID del área (la suscripción está a nivel dependencia)
 * @returns Suscripción activa con plan, o null si no hay
 */
export declare const getActiveSubscriptionByOrganization: (areaId: UUID) => Promise<(Subscription & {
    SubscriptionPlan?: SubscriptionPlan;
}) | null>;
/**
 * Obtiene los límites del plan actual de una organización.
 *
 * @param organizationId - ID de la organización
 * @returns Límites del plan o null si no tiene suscripción activa
 */
export declare const getOrganizationLimits: (organizationId: UUID) => Promise<OrganizationLimits | null>;
/**
 * Obtiene el uso actual a nivel dependencia (usuarios, eventos, actividades en todas las áreas de la dependencia).
 *
 * @param areaId - ID del área (se resuelve dependencia y se cuentan todos los recursos de esa dependencia)
 * @param periodBounds - Opcional, para filtrar eventos por periodo
 */
export declare const getOrganizationUsage: (areaId: UUID, periodBounds?: {
    periodStart: Date;
    periodEnd: Date;
}) => Promise<OrganizationUsage>;
/**
 * Obtiene límites y uso actual de una organización.
 *
 * @param organizationId - ID de la organización
 * @returns Límites y uso, o null si no tiene suscripción activa
 */
export declare const getLimitsAndUsage: (organizationId: UUID) => Promise<LimitsAndUsage | null>;
/**
 * Verifica que la organización no exceda el límite de usuarios.
 *
 * @param organizationId - ID de la organización
 * @param currentCount - Conteo actual (opcional, se calcula si no se pasa)
 * @throws {NotFoundError} Si no tiene suscripción activa
 * @throws {ValidationError} Si se excede el límite
 */
export declare const checkUsersLimit: (organizationId: UUID, currentCount?: number) => Promise<void>;
/**
 * Verifica que la organización no exceda el límite de eventos en el periodo actual.
 *
 * @param organizationId - ID de la organización
 * @param currentCount - Conteo actual en el periodo (opcional, se calcula si no se pasa)
 * @throws {NotFoundError} Si no tiene suscripción activa
 * @throws {ValidationError} Si se excede el límite
 */
export declare const checkEventosLimit: (organizationId: UUID, currentCount?: number) => Promise<void>;
/**
 * Verifica que la organización no exceda el límite de actividades.
 *
 * @param organizationId - ID de la organización
 * @param currentCount - Conteo actual (opcional, se calcula si no se pasa)
 * @throws {NotFoundError} Si no tiene suscripción activa
 * @throws {ValidationError} Si se excede el límite
 */
export declare const checkActividadesLimit: (organizationId: UUID, currentCount?: number) => Promise<void>;
/**
 * Verifica el límite de organizaciones para un plan.
 * Aplica cuando el plan tiene maxOrganizations (ej. capacidad del plan).
 *
 * @param planId - ID del plan
 * @throws {ValidationError} Si se excede el límite
 */
export declare const checkOrganizationsLimit: (planId: UUID) => Promise<void>;
//# sourceMappingURL=subscription-limits.service.d.ts.map