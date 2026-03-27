import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Configuración de Vitest para el backend.
 *
 * - Entorno: NODE_ENV=test (usa DATABASE_TEST_URL cuando no se mockea la BD).
 * - Setup: vitest.setup.ts aplica mocks de Sequelize, Stripe y S3.
 * - Alias: @/* resuelve a src/* (igual que tsconfig).
 */
export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['src/__tests__/integration/**'],
    setupFiles: [path.resolve(__dirname, 'vitest.setup.ts')],
    env: {
      NODE_ENV: 'test',
      ALLOW_REGISTER_WITHOUT_INVITATION: 'true',
      JWT_SECRET: 'test-secret-for-unit-tests',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/index.ts',
        '**/node_modules/**',
        '**/dist/**',
      ],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
