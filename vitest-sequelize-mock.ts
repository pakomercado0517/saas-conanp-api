/**
 * Instancia Sequelize compartida en tests: API completa para Model.init (getQueryInterface, etc.).
 * authenticate/query/transaction están sobrescritos para no conectar a Postgres.
 */
import { vi } from 'vitest';
import { Sequelize } from 'sequelize';

const mockTx = {
  commit: vi.fn().mockResolvedValue(undefined),
  rollback: vi.fn().mockResolvedValue(undefined),
};

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: '127.0.0.1',
  port: 5432,
  database: 'vitest_mock',
  username: 'vitest',
  password: 'vitest',
  logging: false,
});

sequelize.authenticate = vi.fn().mockResolvedValue(undefined) as typeof sequelize.authenticate;
sequelize.query = vi.fn().mockResolvedValue([]) as typeof sequelize.query;
sequelize.transaction = vi
  .fn()
  .mockImplementation((fn?: (t: typeof mockTx) => Promise<unknown>) => {
    if (typeof fn === 'function') {
      return fn(mockTx);
    }
    return Promise.resolve(mockTx);
  }) as typeof sequelize.transaction;
sequelize.close = vi.fn().mockResolvedValue(undefined) as typeof sequelize.close;

export const mockSequelize = sequelize;
