// IMPORTANTE: Importar setup de Zod OpenAPI ANTES que cualquier otro módulo
import './shared/swagger/setup.js';

import app from './server.js';
import { testConnection } from './shared/database/index.js';
import { logger } from './shared/logger/index.js';
import { cache } from './shared/cache/index.js';

const port = parseInt(process.env['PORT'] || '3001');

const server = async (): Promise<void> => {
  try {
    // Probar conexión a la base de datos antes de iniciar el servidor
    await testConnection();

    // Inicializar caché
    cache.initialize();

    app.listen(port, () => {
      logger.info(
        {
          port,
          environment: process.env['NODE_ENV'] || 'development',
        },
        'Servidor iniciado exitosamente'
      );
    });
  } catch (error) {
    logger.fatal(
      {
        error,
        port,
        environment: process.env['NODE_ENV'] || 'development',
      },
      'Error al iniciar el servidor'
    );
    process.exit(1);
  }
};

// Cleanup on shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server and cache');
  await cache.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server and cache');
  await cache.disconnect();
  process.exit(0);
});

void server();
