import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware para validar que el usuario sea super administrador.
 * Requiere que `authenticate` haya corrido antes (req.user debe existir).
 * Verifica que el email del usuario esté en SUPER_ADMIN_EMAILS.
 *
 * @throws {UnauthorizedError} Si no hay usuario autenticado
 * @throws {ForbiddenError} Si el usuario no es super administrador
 *
 * @example
 * ```typescript
 * import { requireSuperAdmin } from '@/shared/middleware';
 *
 * router.post('/admin-only', authenticate, requireSuperAdmin, controller);
 * ```
 */
export declare const requireSuperAdmin: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=super-admin.middleware.d.ts.map