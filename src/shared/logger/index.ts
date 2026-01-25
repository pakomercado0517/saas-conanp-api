import pino from 'pino';

/**
 * Configuración del logger Pino
 *
 * - Development: Usa pino-pretty para logs legibles (similar a morgan "dev")
 * - Production: Usa formato JSON estructurado (similar a morgan "combined")
 *
 * El nivel de log se puede configurar con la variable de entorno LOG_LEVEL.
 * Por defecto: "info" en producción, "debug" en desarrollo.
 */
const loggerConfig: pino.LoggerOptions = {
  level: process.env['LOG_LEVEL'] || (process.env['NODE_ENV'] === 'production' ? 'info' : 'debug'),

  // En desarrollo, usar pino-pretty para logs legibles
  ...(process.env['NODE_ENV'] !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  }),
};

// Crear y exportar la instancia del logger
export const logger = pino(loggerConfig);

export default logger;
