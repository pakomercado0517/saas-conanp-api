import { UnauthorizedError, ForbiddenError, BadRequestError } from '../../shared/errors/index.js';
import { Membership } from '../../modules/users/models/membership.model.js';
/**
 * Middleware genérico para validar que el usuario tenga uno de los roles especificados
 * en la organización del contexto.
 *
 * Requiere que `authenticate` y `requireOrganizationAccess` hayan corrido antes.
 * - `req.user` debe existir (del middleware authenticate)
 * - `req.organizationId` debe existir (del middleware requireOrganizationAccess)
 *
 * @param allowedRoles - Array de roles permitidos para acceder a la ruta
 * @returns Middleware de Express
 *
 * @throws {UnauthorizedError} Si no hay usuario autenticado
 * @throws {BadRequestError} Si no se encuentra organizationId
 * @throws {ForbiddenError} Si el usuario no tiene acceso a la organización o no tiene uno de los roles permitidos
 *
 * @example
 * ```typescript
 * import { requireRole } from '../../shared/middleware';
 *
 * // Solo admins y gestores pueden acceder
 * router.post('/endpoint', authenticate, requireOrganizationAccess, requireRole(['admin', 'gestor']), controller);
 * ```
 */
export const requireRole = (allowedRoles) => async (req, _res, next) => {
    if (!req.user) {
        throw new UnauthorizedError('Token de autenticación requerido');
    }
    const areaId = req.areaId ?? req.organizationId;
    if (!areaId) {
        throw new BadRequestError('areaId/organizationId es requerido. Asegúrate de usar requireOrganizationAccess antes de este middleware');
    }
    const membership = await Membership.findOne({
        where: {
            userId: req.user.userId,
            areaId,
            status: 'activo',
        },
    });
    if (!membership) {
        throw new ForbiddenError('No tienes acceso a esta área', {
            areaId,
            userId: req.user.userId,
        });
    }
    if (!allowedRoles.includes(membership.role)) {
        const rolesStr = allowedRoles.join(', ');
        throw new ForbiddenError(`No tienes permisos para realizar esta acción. Se requiere uno de los siguientes roles: ${rolesStr}`, {
            areaId,
            userId: req.user.userId,
            currentRole: membership.role,
            requiredRoles: allowedRoles,
        });
    }
    next();
};
/**
 * Middleware para validar que el usuario tenga rol 'admin' en la organización.
 *
 * Es un atajo para `requireRole(['admin'])`.
 *
 * Requiere que `authenticate` y `requireOrganizationAccess` hayan corrido antes.
 *
 * @throws {UnauthorizedError} Si no hay usuario autenticado
 * @throws {BadRequestError} Si no se encuentra organizationId
 * @throws {ForbiddenError} Si el usuario no tiene acceso a la organización o no es admin
 *
 * @example
 * ```typescript
 * import { requireAdmin } from '../../shared/middleware';
 *
 * // Solo admins pueden acceder
 * router.post('/endpoint', authenticate, requireOrganizationAccess, requireAdmin, controller);
 * ```
 */
export const requireAdmin = async (req, _res, next) => {
    if (!req.user) {
        throw new UnauthorizedError('Token de autenticación requerido');
    }
    const areaId = req.areaId ?? req.organizationId;
    if (!areaId) {
        throw new BadRequestError('areaId/organizationId es requerido. Asegúrate de usar requireOrganizationAccess antes de este middleware');
    }
    const membership = await Membership.findOne({
        where: {
            userId: req.user.userId,
            areaId,
            status: 'activo',
        },
    });
    if (!membership) {
        throw new ForbiddenError('No tienes acceso a esta área', {
            areaId,
            userId: req.user.userId,
        });
    }
    if (membership.role !== 'admin') {
        throw new ForbiddenError('Solo los administradores pueden realizar esta acción', {
            areaId,
            userId: req.user.userId,
            currentRole: membership.role,
        });
    }
    next();
};
//# sourceMappingURL=role-authorization.middleware.js.map