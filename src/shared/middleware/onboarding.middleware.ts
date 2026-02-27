import type { Request, Response, NextFunction } from 'express';
import { User } from '@/modules/users/models/user.model.js';
import { ForbiddenError, UnauthorizedError } from '@/shared/errors/index.js';

/**
 * Middleware que exige que el usuario haya completado el onboarding
 * (no estar en estado pending_setup).
 *
 * Debe usarse después de authenticate.
 */
export const requireOnboardingComplete = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new UnauthorizedError('Token de autenticación requerido');
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw new UnauthorizedError('Usuario no encontrado');
  }

  if (user.onboardingStatus === 'pending_setup') {
    throw new ForbiddenError(
      'Debes completar el onboarding (crear tu dependencia y área inicial) antes de usar esta sección'
    );
  }

  next();
};

