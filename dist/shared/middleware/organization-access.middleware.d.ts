import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware multi-tenant: valida que el usuario pertenezca a la organización
 * y que la organización tenga suscripción activa (active o trialing).
 * Extrae organizationId del request (params o body) y lo agrega a req.organizationId.
 *
 * Requiere que authenticate haya corrido antes (req.user debe existir).
 * organizationId se busca en req.params.organizationId primero, luego en req.body.organizationId.
 *
 * @throws {UnauthorizedError} Si no hay usuario autenticado
 * @throws {BadRequestError} Si no se encuentra organizationId
 * @throws {ForbiddenError} Si el usuario no tiene membresía activa en la organización
 * @throws {ForbiddenError} Si la suscripción está inactiva o vencida
 */
export declare const requireOrganizationAccess: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware multi-tenant: valida solo que el usuario pertenezca a la organización
 * (membresía activa). No valida suscripción activa.
 * Úsalo en rutas que deben ser accesibles sin suscripción (ej. crear suscripción, obtener suscripción actual).
 *
 * Requiere que authenticate haya corrido antes.
 *
 * @throws {UnauthorizedError} Si no hay usuario autenticado
 * @throws {BadRequestError} Si no se encuentra organizationId
 * @throws {ForbiddenError} Si el usuario no tiene membresía activa en la organización
 */
export declare const requireOrganizationAccessOnly: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=organization-access.middleware.d.ts.map