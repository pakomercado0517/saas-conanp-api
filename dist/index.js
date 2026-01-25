import app from './server.js';
import { testConnection } from './shared/database/index.js';
import { logger } from './shared/logger/index.js';
const port = parseInt(process.env['PORT'] || '3001');
const server = async () => {
    try {
        // Probar conexión a la base de datos antes de iniciar el servidor
        await testConnection();
        app.listen(port, () => {
            logger.info({
                port,
                environment: process.env['NODE_ENV'] || 'development',
            }, 'Servidor iniciado exitosamente');
        });
    }
    catch (error) {
        logger.fatal({
            error,
            port,
            environment: process.env['NODE_ENV'] || 'development',
        }, 'Error al iniciar el servidor');
        process.exit(1);
    }
};
void server();
//# sourceMappingURL=index.js.map