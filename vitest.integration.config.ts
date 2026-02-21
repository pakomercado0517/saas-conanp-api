import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Configuración de Vitest para tests de integración.
 *
 * - Usa BD real (DATABASE_TEST_URL); no se mockea Sequelize.
 * - Setup: vitest.integration.setup.ts (mocks de Stripe y S3 únicamente).
 * - Incluye solo archivos en src/__tests__/integration/.
 */
export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['src/__tests__/integration/**/*.integration.test.ts'],
    setupFiles: [path.resolve(__dirname, 'vitest.integration.setup.ts')],
    env: {
      NODE_ENV: 'test',
      ALLOW_REGISTER_WITHOUT_INVITATION: 'true',
      JWT_SECRET: 'test-secret-for-integration-tests',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
    },
    testTimeout: 20000,
    hookTimeout: 20000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
