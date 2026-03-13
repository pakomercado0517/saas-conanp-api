import type { Request, Response, NextFunction } from 'express';
import { sequelize } from '@/shared/database/index.js';
import { Area } from '@/modules/areas/models/area.model.js';
import type { Transaction } from 'sequelize';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Sets PostgreSQL session variables scoped to the given transaction.
 * Uses SET LOCAL so variables are automatically cleared on COMMIT/ROLLBACK.
 */
const setLocalVar = async (
  transaction: Transaction,
  name: string,
  value: string
): Promise<void> => {
  await sequelize.query(`SET LOCAL ${name} = '${value}'`, { transaction });
};

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
export const setTenantContext = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await sequelize.transaction(async (transaction) => {
      if (req.isSuperAdmin) {
        await setLocalVar(transaction, 'app.rls_bypass', 'true');
      } else {
        const areaId = req.areaId;
        const dependenciaId = req.dependenciaId;

        if (areaId && UUID_RE.test(areaId)) {
          await setLocalVar(transaction, 'app.current_area_id', areaId);

          const area = await Area.findByPk(areaId, { transaction });
          if (area) {
            await setLocalVar(transaction, 'app.current_dep_id', area.dependenciaId);
          }
        } else if (dependenciaId && UUID_RE.test(dependenciaId)) {
          await setLocalVar(transaction, 'app.current_dep_id', dependenciaId);
        }
      }

      await new Promise<void>((resolve, reject) => {
        const onFinish = (): void => {
          res.removeListener('error', onError);
          resolve();
        };
        const onError = (err: Error): void => {
          res.removeListener('finish', onFinish);
          reject(err);
        };

        res.once('finish', onFinish);
        res.once('error', onError);

        next();
      });
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Executes a callback inside a transaction with RLS bypass enabled.
 * Useful for system-level operations that need cross-tenant access
 * (e.g. Stripe webhook processing).
 */
export const withRlsBypass = async <T>(fn: () => Promise<T>): Promise<T> => {
  return sequelize.transaction(async (transaction) => {
    await setLocalVar(transaction, 'app.rls_bypass', 'true');
    return fn();
  });
};
