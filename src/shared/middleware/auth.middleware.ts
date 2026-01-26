import type { Request, Response, NextFunction } from 'express';
import { validateToken } from '@/modules/auth/services/auth.service.js';
import { UnauthorizedError } from '@/shared/errors/index.js';
import { logger } from '@/shared/logger/index.js';

/**
 * Extrae el token JWT del header Authorization
 *
 * Formato esperado: "Bearer <token>"
 *
 * @param authHeader - Valor del header Authorization
 * @returns Token JWT o null si no se encuentra
 */
const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) {
    return null;
  }

  // Verificar que comience con "Bearer "
  const bearerPrefix = 'Bearer ';
  if (!authHeader.startsWith(bearerPrefix)) {
    return null;
  }

  // Extraer el token (después de "Bearer ")
  const token = authHeader.substring(bearerPrefix.length).trim();

  // Verificar que el token no esté vacío
  if (token.length === 0) {
    return null;
  }

  return token;
};

/**
 * Middleware de autenticación JWT
 *
 * Extrae y valida el token JWT del header Authorization.
 * Si el token es válido, agrega el payload del JWT a `req.user`.
 * Si el token es inválido o no se proporciona, lanza un UnauthorizedError.
 *
 * Uso:
 * ```typescript
 * import { authenticate } from '@/shared/middleware';
 *
 * router.get('/protected', authenticate, protectedController);
 * ```
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 * @throws {UnauthorizedError} Si el token no se proporciona o es inválido
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      logger.warn(
        {
          path: req.path,
          method: req.method,
          ip: req.ip || req.socket.remoteAddress,
        },
        'Intento de acceso sin token de autenticación'
      );

      throw new UnauthorizedError('Token de autenticación requerido');
    }

    // Validar el token usando el service de autenticación
    // validateToken lanza UnauthorizedError si el token es inválido
    const payload = validateToken(token);

    // Agregar el payload del JWT a req.user
    req.user = payload;

    // Logging estructurado (solo en desarrollo o para auditoría)
    if (process.env['NODE_ENV'] !== 'production') {
      logger.debug(
        {
          userId: payload.userId,
          email: payload.email,
          path: req.path,
          method: req.method,
        },
        'Usuario autenticado exitosamente'
      );
    }

    // Continuar con el siguiente middleware
    next();
  } catch (error) {
    // Si es un UnauthorizedError, pasarlo directamente
    if (error instanceof UnauthorizedError) {
      next(error);
      return;
    }

    // Para cualquier otro error, loggear y lanzar UnauthorizedError genérico
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Error desconocido',
        path: req.path,
        method: req.method,
        ip: req.ip || req.socket.remoteAddress,
      },
      'Error inesperado durante la autenticación'
    );

    next(new UnauthorizedError('Error al validar el token de autenticación'));
  }
};

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
 * import { optionalAuthenticate } from '@/shared/middleware';
 *
 * router.get('/public-or-private', optionalAuthenticate, controller);
 * ```
 *
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - NextFunction de Express
 */
export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    // Si no hay token, simplemente continuar sin autenticación
    if (!token) {
      next();
      return;
    }

    // Intentar validar el token
    try {
      const payload = validateToken(token);
      req.user = payload;

      // Logging estructurado (solo en desarrollo)
      if (process.env['NODE_ENV'] !== 'production') {
        logger.debug(
          {
            userId: payload.userId,
            email: payload.email,
            path: req.path,
            method: req.method,
          },
          'Usuario autenticado opcionalmente'
        );
      }
    } catch (tokenError) {
      // Si el token es inválido, simplemente continuar sin autenticación
      // No lanzar error, solo loggear en desarrollo
      if (process.env['NODE_ENV'] !== 'production') {
        logger.debug(
          {
            path: req.path,
            method: req.method,
            error: tokenError instanceof Error ? tokenError.message : 'Token inválido',
          },
          'Token inválido en autenticación opcional, continuando sin autenticación'
        );
      }
    }

    // Continuar con el siguiente middleware
    next();
  } catch (error) {
    // Para errores inesperados, loggear y continuar sin autenticación
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Error desconocido',
        path: req.path,
        method: req.method,
        ip: req.ip || req.socket.remoteAddress,
      },
      'Error inesperado durante la autenticación opcional'
    );

    // Continuar sin autenticación en lugar de fallar
    next();
  }
};
