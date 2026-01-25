import express from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
import dotenv from "dotenv";
import { errorHandler } from "./shared/middleware/index.js";
import { now } from "./shared/dates/index.js";
dotenv.config();
const app = express();
// CORS: Configurar según entorno
const corsOptions = {
    origin: process.env["FRONTEND_URL"] ||
        process.env["APP_URL"] ||
        (process.env["NODE_ENV"] === "production" ? false : "http://localhost:3000"),
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
// Logging HTTP con Pino: Diferente formato según entorno
// Development: logs legibles (similar a morgan "dev")
// Production: JSON estructurado (similar a morgan "combined")
import { logger } from "./shared/logger/index.js";
app.use(pinoHttp({
    logger,
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Health check endpoint
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: now().toISO(),
        uptime: process.uptime(),
        environment: process.env["NODE_ENV"] || "development",
    });
});
app.get("/", (_req, res) => res.send({ message: "Bienvenido a la API de CONANP - Gestión de Áreas Naturales Protegidas" }));
// Aquí irían todas las rutas de la aplicación
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/organizations', organizationsRoutes);
// etc.
// Middleware de manejo de errores globales
// IMPORTANTE: Debe ir después de todas las rutas pero antes del 404
app.use(errorHandler);
// Manejo de rutas no encontradas (404)
// Debe ir al final, después del error handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Ruta no encontrada",
        message: `La ruta ${req.method} ${req.path} no existe`,
        code: "NOT_FOUND",
    });
});
export default app;
//# sourceMappingURL=server.js.map