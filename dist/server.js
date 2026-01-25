import express from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
import dotenv from "dotenv";
import { AppError } from "./shared/errors/index.js";
import { logger } from "./shared/logger/index.js";
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
app.use(pinoHttp({
    logger,
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Health check endpoint
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env["NODE_ENV"] || "development",
    });
});
app.get("/", (_req, res) => res.send({ message: "Bienvenido a la API de CONANP - Gestión de Áreas Naturales Protegidas" }));
/**
 * Type guard para verificar si un error es AppError
 */
const isAppError = (error) => {
    return error instanceof AppError;
};
/**
 * Middleware de manejo de errores centralizado
 *
 * Reconoce errores personalizados (AppError) y retorna respuestas estructuradas
 * con códigos HTTP apropiados. Para errores desconocidos, retorna 500.
 */
app.use((err, req, res, _next) => {
    const isDevelopment = process.env["NODE_ENV"] !== "production";
    // Verificar que es un Error
    if (!(err instanceof Error)) {
        logger.error({
            error: "Error desconocido sin instancia de Error",
            path: req.path,
            method: req.method
        }, "Error interno del servidor");
        res.status(500).json({
            success: false,
            error: "Error interno del servidor",
            message: "Ocurrió un error inesperado. Por favor intenta nuevamente más tarde.",
            code: "INTERNAL_SERVER_ERROR",
        });
        return;
    }
    // Si es un error personalizado (AppError), usar su estructura
    if (isAppError(err)) {
        const errorResponse = err.toJSON();
        logger.error({
            error: err,
            statusCode: err.statusCode,
            code: errorResponse.code,
            path: req.path,
            method: req.method,
            ...(isDevelopment && { stack: err.stack }),
        }, "Error de aplicación");
        res.status(err.statusCode).json({
            ...errorResponse,
            ...(isDevelopment && { stack: err.stack }),
        });
        return;
    }
    // Para errores de validación de Zod (si se usan directamente)
    if (err.name === "ZodError") {
        logger.warn({
            error: err,
            path: req.path,
            method: req.method,
            ...(isDevelopment && { stack: err.stack }),
        }, "Error de validación");
        res.status(400).json({
            success: false,
            error: "Error de validación",
            message: "Los datos proporcionados no son válidos",
            code: "VALIDATION_ERROR",
            ...(isDevelopment && { details: err.message, stack: err.stack }),
        });
        return;
    }
    // Para errores desconocidos, retornar 500
    logger.error({
        error: err,
        name: err.name,
        message: err.message,
        path: req.path,
        method: req.method,
        ...(isDevelopment && { stack: err.stack }),
    }, "Error interno del servidor");
    res.status(500).json({
        success: false,
        error: "Error interno del servidor",
        message: isDevelopment
            ? err.message
            : "Ocurrió un error inesperado. Por favor intenta nuevamente más tarde.",
        code: "INTERNAL_SERVER_ERROR",
        ...(isDevelopment && { stack: err.stack }),
    });
});
// Manejo de rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).json({
        error: "Ruta no encontrada",
        message: `La ruta ${req.method} ${req.path} no existe`,
    });
});
export default app;
//# sourceMappingURL=server.js.map