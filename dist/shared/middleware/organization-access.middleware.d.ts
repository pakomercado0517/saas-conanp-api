import type { Request, Response, NextFunction } from 'express';
/**
 * Multi-tenant: valida acceso al área (membresía activa) y suscripción activa de la dependencia.
 * After validation, starts an RLS-scoped transaction (via setTenantContext) so all subsequent
 * queries are automatically filtered by PostgreSQL RLS policies.
 * Requiere authenticate previo.
 */
export declare const requireOrganizationAccess: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Multi-tenant: valida solo acceso al área (membresía activa). No valida suscripción.
 * Úsalo en rutas que no requieren suscripción activa (ej. suscripciones, onboarding).
 * Starts RLS context after validation.
 */
export declare const requireOrganizationAccessOnly: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Multi-tenant: valida acceso a la dependencia (membresía en al menos un área de esa dependencia).
 * Starts RLS context after validation.
 * Requiere authenticate previo.
 */
export declare const requireDependenciaAccess: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=organization-access.middleware.d.ts.map