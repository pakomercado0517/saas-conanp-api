import type { Request, Response, NextFunction } from 'express';
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
export declare const requireOrganizationAccess: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=organization-access.middleware.d.ts.map