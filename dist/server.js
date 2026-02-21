import express from 'express';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { errorHandler, apiLimiter, webhookLimiter } from './shared/middleware/index.js';
import { now } from './shared/dates/index.js';
// Importar el módulo swagger ANTES de generateOpenAPISpec para que se registren los paths
import './shared/swagger/index.js';
import { generateOpenAPISpec } from './shared/swagger/index.js';
dotenv.config();
const app = express();
// CORS: Configurar según entorno
const corsOptions = {
    origin: process.env['FRONTEND_URL'] ||
        process.env['APP_URL'] ||
        (process.env['NODE_ENV'] === 'production' ? false : 'http://localhost:3000'),
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
// Rate limiting: Solo se aplica en producción
app.use(apiLimiter);
// Logging HTTP con Pino: Diferente formato según entorno
// Development: una línea por request (método, url, status, tiempo)
// Production: JSON estructurado (similar a morgan "combined")
import { logger } from './shared/logger/index.js';
const isDev = process.env['NODE_ENV'] !== 'production';
app.use(pinoHttp({
    logger,
    ...(isDev && {
        serializers: {
            req: (req) => ({
                method: req.method,
                url: req.url,
            }),
            res: (res) => ({
                statusCode: res.statusCode,
            }),
        },
        customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
    }),
}));
// Webhook Stripe: rate limit + raw body para validar firma (antes de json/urlencoded)
import stripeWebhookRoutes from './modules/payments/routes/stripe-webhook.routes.js';
app.use('/api/v1/webhooks/stripe', webhookLimiter, express.raw({ type: 'application/json' }), stripeWebhookRoutes);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: now().toISO(),
        uptime: process.uptime(),
        environment: process.env['NODE_ENV'] || 'development',
    });
});
app.get('/', (_req, res) => res.send({ message: 'Bienvenido a la API de CONANP - Gestión de Áreas Naturales Protegidas' }));
// Documentación Swagger UI
const swaggerSpec = generateOpenAPISpec();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'CONANP API - Documentación',
}));
// Rutas de la aplicación
import { authRoutes } from './modules/auth/routes/index.js';
import { organizationsRoutes } from './modules/organizations/routes/index.js';
import { usersRoutes } from './modules/users/routes/index.js';
import subscriptionPlanRouter from './modules/subscriptions/routes/subscription-plan.routes.js';
import subscriptionRouter from './modules/subscriptions/routes/subscription.routes.js';
import adminOrganizationRouter from './modules/organizations/routes/organization-admin.routes.js';
import invitationValidateRouter from './modules/users/routes/invitation-validate.routes.js';
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/organizations', organizationsRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/subscription-plans', subscriptionPlanRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/admin/organizations', adminOrganizationRouter);
app.use('/api/v1/invitations', invitationValidateRouter);
// Middleware de manejo de errores globales
// IMPORTANTE: Debe ir después de todas las rutas pero antes del 404
app.use(errorHandler);
// Manejo de rutas no encontradas (404)
// Debe ir al final, después del error handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada',
        message: `La ruta ${req.method} ${req.path} no existe`,
        code: 'NOT_FOUND',
    });
});
export default app;
//# sourceMappingURL=server.js.map