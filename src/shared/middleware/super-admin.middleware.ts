import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '@/shared/errors/index.js';

/**
 * Lista de emails de super administradores.
 * Se lee de la variable de entorno SUPER_ADMIN_EMAILS (emails separados por coma).
 * Comparación case-insensitive.
 */
const getSuperAdminEmails = (): Set<string> => {
  const emails = process.env['SUPER_ADMIN_EMAILS'];
  if (!emails || typeof emails !== 'string' || emails.trim() === '') {
    return new Set();
  }
  return new Set(
    emails
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0)
  );
};

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
export const requireSuperAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    throw new UnauthorizedError('Token de autenticación requerido');
  }

  const superAdminEmails = getSuperAdminEmails();
  if (superAdminEmails.size === 0) {
    throw new ForbiddenError('No hay super administradores configurados');
  }

  const userEmail = req.user.email?.trim().toLowerCase() ?? '';
  if (!superAdminEmails.has(userEmail)) {
    throw new ForbiddenError('Solo los super administradores pueden realizar esta acción', {
      userId: req.user.userId,
      email: req.user.email,
    });
  }

  next();
};
