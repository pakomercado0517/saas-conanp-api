import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware que exige que el usuario haya completado el onboarding
 * (no estar en estado pending_setup).
 *
 * Debe usarse después de authenticate.
 */
export declare const requireOnboardingComplete: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=onboarding.middleware.d.ts.map