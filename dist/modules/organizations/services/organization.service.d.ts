import type { UUID, SubscriptionStatus } from '../../../shared/database/types.js';
import { Area } from '../../../modules/areas/models/area.model.js';
import type { CreateOrganizationDTO, UpdateOrganizationDTO, ListOrganizationsDTO } from '../../../modules/organizations/validators/organization.validator.js';
import type { PaginationMeta } from '../../../shared/responses/types.js';
/**
 * Valida que el usuario tenga acceso a la organización.
 * Verifica membresía activa (userId + organizationId, status 'activo').
 *
 * @throws {ForbiddenError} Si no existe membresía activa
 */
/**
 * Valida que el usuario tenga acceso al área (membresía activa en esa área).
 */
export declare const assertCanAccessOrganization: (userId: UUID, areaId: UUID) => Promise<void>;
/**
 * Valida que el usuario tenga acceso a la dependencia.
 * Primero comprueba DependenciaMembership (owner/admin en la dependencia); si no hay, comprueba membresía en al menos un área de esa dependencia.
 */
export declare const assertCanAccessDependencia: (userId: UUID, dependenciaId: UUID) => Promise<void>;
/**
 * Verifica que la organización tenga suscripción activa (active o trialing)
 * y que el periodo actual no haya vencido.
 * Bloquea si no hay suscripción, está inactiva/past_due/canceled o el periodo expiró.
 *
 * @throws {ForbiddenError} Si no hay suscripción, el estado no permite operaciones o está vencida
 */
export declare const assertActiveSubscription: (areaId: UUID) => Promise<void>;
/**
 * Obtiene el estado de la suscripción de la organización.
 *
 * @returns Estado y fecha de fin del periodo, o null si no hay suscripción
 */
export declare const getSubscriptionStatus: (areaId: UUID) => Promise<{
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
export declare const getBrazaletesConfig: (areaId: UUID) => Promise<BrazaletesConfig>;
/**
 * Obtiene la configuración de acceso (brazaletes/pasaporte) para el frontend.
 * Incluye organizationId, name y acceso (brazaletesObligatorios, brazaletesExcluyenLocales).
 * Valida que el usuario tenga acceso a la organización.
 */
export declare const getConfigAcceso: (areaId: UUID, userId: UUID) => Promise<{
    organizationId: UUID;
    name: string;
    acceso: BrazaletesConfig;
}>;
/**
 * Obtiene la información del plan actual de la organización (solo si la suscripción está activa).
 *
 * @returns Información del plan y periodo, o null si no hay suscripción activa
 */
export declare const getCurrentPlanInfo: (areaId: UUID) => Promise<CurrentPlanInfo | null>;
/**
 * Crea una nueva dependencia y su primera área (flujo admin / onboarding).
 * No requiere validación de acceso.
 */
export declare const createOrganization: (data: CreateOrganizationDTO) => Promise<Area>;
/**
 * Obtiene un área por ID.
 * Filtro multi-tenant: solo si el usuario tiene acceso vía membresía activa.
 * Bloquea si la dependencia no tiene suscripción activa.
 */
export declare const getOrganizationById: (areaId: UUID, userId: UUID) => Promise<Area>;
/**
 * Lista áreas con paginación y filtros.
 * Filtro multi-tenant: solo áreas donde el usuario tiene membresía activa.
 */
export declare const listOrganizations: (filters: ListOrganizationsDTO, userId: UUID) => Promise<{
    data: Area[];
    pagination: PaginationMeta;
}>;
/**
 * Actualiza un área.
 * Filtro multi-tenant: solo si el usuario tiene acceso.
 * Bloquea si la suscripción no está activa.
 */
export declare const updateOrganization: (areaId: UUID, data: UpdateOrganizationDTO, userId: UUID) => Promise<Area>;
/**
 * Elimina una organización (soft delete).
 * Filtro multi-tenant: solo si el usuario tiene acceso.
 * Bloquea si la suscripción no está activa.
 */
export declare const deleteOrganization: (areaId: UUID, userId: UUID) => Promise<void>;
//# sourceMappingURL=organization.service.d.ts.map