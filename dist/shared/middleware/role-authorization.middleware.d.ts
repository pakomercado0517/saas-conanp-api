import type { Request, Response, NextFunction } from 'express';
import type { Role } from '../../shared/database/types.js';
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
export declare const requireRole: (allowedRoles: Role[]) => (req: Request, _res: Response, next: NextFunction) => Promise<void>;
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
export declare const requireAdmin: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=role-authorization.middleware.d.ts.map