import { UnauthorizedError, BadRequestError } from '../../shared/errors/index.js';
import { assertCanAccessOrganization, assertCanAccessDependencia, assertActiveSubscription, } from '../../modules/organizations/services/organization.service.js';
/**
 * Multi-tenant: valida acceso al área (membresía activa) y suscripción activa de la dependencia.
 * Lee el id de área de params.organizationId o params.areaId o body; lo expone en req.organizationId y req.areaId.
 * Requiere authenticate previo.
 */
export const requireOrganizationAccess = async (req, _res, next) => {
    if (!req.user) {
        throw new UnauthorizedError('Token de autenticación requerido');
    }
    const areaId = req.params['areaId'] ||
        req.params['organizationId'] ||
        (typeof req.body?.areaId === 'string' ? req.body.areaId : undefined) ||
        (typeof req.body?.organizationId === 'string' ? req.body.organizationId : undefined);
    if (!areaId) {
        throw new BadRequestError('areaId u organizationId es requerido');
    }
    await assertCanAccessOrganization(req.user.userId, areaId);
    await assertActiveSubscription(areaId);
    req.organizationId = areaId;
    req.areaId = areaId;
    next();
};
/**
 * Multi-tenant: valida solo acceso al área (membresía activa). No valida suscripción.
 * Úsalo en rutas que no requieren suscripción activa (ej. suscripciones, onboarding).
 */
export const requireOrganizationAccessOnly = async (req, _res, next) => {
    if (!req.user) {
        throw new UnauthorizedError('Token de autenticación requerido');
    }
    const areaId = req.params['areaId'] ||
        req.params['organizationId'] ||
        (typeof req.body?.areaId === 'string' ? req.body.areaId : undefined) ||
        (typeof req.body?.organizationId === 'string' ? req.body.organizationId : undefined);
    if (!areaId) {
        throw new BadRequestError('areaId u organizationId es requerido');
    }
    await assertCanAccessOrganization(req.user.userId, areaId);
    req.organizationId = areaId;
    req.areaId = areaId;
    next();
};
/**
 * Multi-tenant: valida acceso a la dependencia (membresía en al menos un área de esa dependencia).
 * Lee dependenciaId de params.dependenciaId o body; lo expone en req.dependenciaId.
 * Requiere authenticate previo.
 */
export const requireDependenciaAccess = async (req, _res, next) => {
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
    next();
};
//# sourceMappingURL=organization-access.middleware.js.map