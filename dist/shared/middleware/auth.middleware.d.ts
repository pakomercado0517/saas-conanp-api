import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware de autenticación JWT
 *
 * Extrae y valida el token JWT del header Authorization.
 * Si el token es válido, agrega el payload del JWT a `req.user`.
 * Si el token es inválido o no se proporciona, lanza un UnauthorizedError.
 *
 * Uso:
 * ```typescript
 * import { authenticate } from '../../shared/middleware';
 *
 * router.get('/protected', authenticate, protectedController);
 * ```
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 * @throws {UnauthorizedError} Si el token no se proporciona o es inválido
 */
export declare const authenticate: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware opcional de autenticación
 *
 * Similar a `authenticate`, pero no lanza error si no se proporciona token.
 * Útil para endpoints que pueden funcionar con o sin autenticación.
 *
 * Si se proporciona un token válido, agrega el payload a `req.user`.
 * Si no se proporciona token o es inválido, simplemente continúa sin `req.user`.
 *
 * Uso:
 * ```typescript
 * import { optionalAuthenticate } from '../../shared/middleware';
 *
 * router.get('/public-or-private', optionalAuthenticate, controller);
 * ```
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export declare const optionalAuthenticate: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map