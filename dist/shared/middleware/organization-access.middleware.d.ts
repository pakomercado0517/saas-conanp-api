import type { Request, Response, NextFunction } from 'express';
/**
 * Multi-tenant: valida acceso al área (membresía activa) y suscripción activa de la dependencia.
 * Lee el id de área de params.organizationId o params.areaId o body; lo expone en req.organizationId y req.areaId.
 * Requiere authenticate previo.
 */
export declare const requireOrganizationAccess: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Multi-tenant: valida solo acceso al área (membresía activa). No valida suscripción.
 * Úsalo en rutas que no requieren suscripción activa (ej. suscripciones, onboarding).
 */
export declare const requireOrganizationAccessOnly: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Multi-tenant: valida acceso a la dependencia (membresía en al menos un área de esa dependencia).
 * Lee dependenciaId de params.dependenciaId o body; lo expone en req.dependenciaId.
 * Requiere authenticate previo.
 */
export declare const requireDependenciaAccess: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=organization-access.middleware.d.ts.map