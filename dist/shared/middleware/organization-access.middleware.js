import { UnauthorizedError, BadRequestError } from '../../shared/errors/index.js';
import { assertCanAccessOrganization, assertCanAccessDependencia, assertActiveSubscription, } from '../../modules/organizations/services/organization.service.js';
import { setTenantContext } from './rls.middleware.js';
/**
 * Extracts areaId from params or body (supports both areaId and legacy organizationId).
 */
const extractAreaId = (req) => req.params['areaId'] ||
    req.params['organizationId'] ||
    (typeof req.body?.areaId === 'string' ? req.body.areaId : undefined) ||
    (typeof req.body?.organizationId === 'string' ? req.body.organizationId : undefined);
/**
 * Multi-tenant: valida acceso al área (membresía activa) y suscripción activa de la dependencia.
 * After validation, starts an RLS-scoped transaction (via setTenantContext) so all subsequent
 * queries are automatically filtered by PostgreSQL RLS policies.
 * Requiere authenticate previo.
 */
export const requireOrganizationAccess = async (req, res, next) => {
    if (!req.user) {
        throw new UnauthorizedError('Token de autenticación requerido');
    }
    const areaId = extractAreaId(req);
    if (!areaId) {
        throw new BadRequestError('areaId u organizationId es requerido');
    }
    await assertCanAccessOrganization(req.user.userId, areaId);
    await assertActiveSubscription(areaId);
    req.organizationId = areaId;
    req.areaId = areaId;
    setTenantContext(req, res, next);
};
/**
 * Multi-tenant: valida solo acceso al área (membresía activa). No valida suscripción.
 * Úsalo en rutas que no requieren suscripción activa (ej. suscripciones, onboarding).
 * Starts RLS context after validation.
 */
export const requireOrganizationAccessOnly = async (req, res, next) => {
    if (!req.user) {
        throw new UnauthorizedError('Token de autenticación requerido');
    }
    const areaId = extractAreaId(req);
    if (!areaId) {
        throw new BadRequestError('areaId u organizationId es requerido');
    }
    await assertCanAccessOrganization(req.user.userId, areaId);
    req.organizationId = areaId;
    req.areaId = areaId;
    setTenantContext(req, res, next);
};
/**
 * Multi-tenant: valida acceso a la dependencia (membresía en al menos un área de esa dependencia).
 * Starts RLS context after validation.
 * Requiere authenticate previo.
 */
export const requireDependenciaAccess = async (req, res, next) => {
    if (!req.user) {
        throw new UnauthorizedError('Token de autenticación requerido');
    }
    const dependenciaId = req.params['dependenciaId'] ||
        (typeof req.body?.dependenciaId === 'string' ? req.body.dependenciaId : undefined);
    if (!dependenciaId) {
        throw new BadRequestError('dependenciaId es requerido');
    }
    await assertCanAccessDependencia(req.user.userId, dependenciaId);
    req.dependenciaId = dependenciaId;
    setTenantContext(req, res, next);
};
//# sourceMappingURL=organization-access.middleware.js.map