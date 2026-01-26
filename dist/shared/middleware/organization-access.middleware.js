import { UnauthorizedError, BadRequestError } from '../../shared/errors/index.js';
import { assertCanAccessOrganization } from '../../modules/organizations/services/organization.service.js';
/**
 * Middleware multi-tenant: valida que el usuario pertenezca a la organización,
 * extrae organizationId del request (params o body) y lo agrega a req.organizationId.
 *
 * Requiere que authenticate haya corrido antes (req.user debe existir).
 * organizationId se busca en req.params.organizationId primero, luego en req.body.organizationId.
 *
 * @throws {UnauthorizedError} Si no hay usuario autenticado
 * @throws {BadRequestError} Si no se encuentra organizationId
 * @throws {ForbiddenError} Si el usuario no tiene membresía activa en la organización
 */
export const requireOrganizationAccess = async (req, _res, next) => {
    if (!req.user) {
        throw new UnauthorizedError('Token de autenticación requerido');
    }
    const organizationId = req.params['organizationId'] ||
        (typeof req.body?.organizationId === 'string' ? req.body.organizationId : undefined);
    if (!organizationId) {
        throw new BadRequestError('organizationId es requerido');
    }
    await assertCanAccessOrganization(req.user.userId, organizationId);
    req.organizationId = organizationId;
    next();
};
//# sourceMappingURL=organization-access.middleware.js.map