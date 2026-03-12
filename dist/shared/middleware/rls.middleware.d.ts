import type { Request, Response, NextFunction } from 'express';
/**
 * RLS middleware — wraps the request in a Sequelize transaction and sets
 * PostgreSQL session variables that RLS policies evaluate.
 *
 * Must run AFTER authenticate + requireOrganizationAccess / requireDependenciaAccess
 * (so that req.areaId / req.dependenciaId / req.isSuperAdmin are already populated).
 *
 * Because Sequelize is configured with CLS, all queries executed during the
 * request automatically use this transaction (and therefore see the variables).
 */
export declare const setTenantContext: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Executes a callback inside a transaction with RLS bypass enabled.
 * Useful for system-level operations that need cross-tenant access
 * (e.g. Stripe webhook processing).
 */
export declare const withRlsBypass: <T>(fn: () => Promise<T>) => Promise<T>;
//# sourceMappingURL=rls.middleware.d.ts.map