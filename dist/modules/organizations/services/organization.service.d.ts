import type { UUID, SubscriptionStatus } from '../../../shared/database/types';
import { Organization } from '../../../modules/organizations/models/organization.model';
import type { CreateOrganizationDTO, UpdateOrganizationDTO, ListOrganizationsDTO } from '../../../modules/organizations/validators/organization.validator';
import type { PaginationMeta } from '../../../shared/responses/types';
/**
 * Valida que el usuario tenga acceso a la organización.
 * Verifica membresía activa (userId + organizationId, status 'activo').
 *
 * @throws {ForbiddenError} Si no existe membresía activa
 */
export declare const assertCanAccessOrganization: (userId: UUID, organizationId: UUID) => Promise<void>;
/**
 * Verifica que la organización tenga suscripción activa (active o trialing)
 * y que el periodo actual no haya vencido.
 * Bloquea si no hay suscripción, está inactiva/past_due/canceled o el periodo expiró.
 *
 * @throws {ForbiddenError} Si no hay suscripción, el estado no permite operaciones o está vencida
 */
export declare const assertActiveSubscription: (organizationId: UUID) => Promise<void>;
/**
 * Obtiene el estado de la suscripción de la organización.
 *
 * @returns Estado y fecha de fin del periodo, o null si no hay suscripción
 */
export declare const getSubscriptionStatus: (organizationId: UUID) => Promise<{
    status: SubscriptionStatus;
    currentPeriodEnd: Date;
} | null>;
export interface CurrentPlanInfo {
    planId: UUID;
    planName: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    limits: {
        maxUsers: number | null;
        maxEventos: number | null;
        maxActividades: number | null;
    };
}
/** Configuración de brazaletes por ANP (extraída de settings.acceso). */
export interface BrazaletesConfig {
    brazaletesObligatorios: boolean | null;
    brazaletesExcluyenLocales: boolean;
}
/**
 * Obtiene la configuración de brazaletes/pasaporte de una organización.
 * No valida acceso ni suscripción; usar después de assertCanAccessOrganization si aplica.
 *
 * @returns { brazaletesObligatorios, brazaletesExcluyenLocales } normalizado
 * @throws {NotFoundError} Si la organización no existe
 */
export declare const getBrazaletesConfig: (organizationId: UUID) => Promise<BrazaletesConfig>;
/**
 * Obtiene la información del plan actual de la organización (solo si la suscripción está activa).
 *
 * @returns Información del plan y periodo, o null si no hay suscripción activa
 */
export declare const getCurrentPlanInfo: (organizationId: UUID) => Promise<CurrentPlanInfo | null>;
/**
 * Crea una nueva organización.
 * No requiere validación de acceso (no hay organización previa).
 */
export declare const createOrganization: (data: CreateOrganizationDTO) => Promise<Organization>;
/**
 * Obtiene una organización por ID.
 * Filtro multi-tenant: solo si el usuario tiene acceso vía membresía activa.
 * Bloquea si la organización no tiene suscripción activa.
 */
export declare const getOrganizationById: (organizationId: UUID, userId: UUID) => Promise<Organization>;
/**
 * Lista organizaciones con paginación y filtros.
 * Filtro multi-tenant obligatorio: solo organizaciones donde el usuario tiene membresía activa.
 */
export declare const listOrganizations: (filters: ListOrganizationsDTO, userId: UUID) => Promise<{
    data: Organization[];
    pagination: PaginationMeta;
}>;
/**
 * Actualiza una organización.
 * Filtro multi-tenant: solo si el usuario tiene acceso.
 * Bloquea si la suscripción no está activa.
 */
export declare const updateOrganization: (organizationId: UUID, data: UpdateOrganizationDTO, userId: UUID) => Promise<Organization>;
/**
 * Elimina una organización (soft delete).
 * Filtro multi-tenant: solo si el usuario tiene acceso.
 * Bloquea si la suscripción no está activa.
 */
export declare const deleteOrganization: (organizationId: UUID, userId: UUID) => Promise<void>;
//# sourceMappingURL=organization.service.d.ts.map