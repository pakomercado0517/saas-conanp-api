import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();
const app = express();
// CORS: Configurar según entorno
const corsOptions = {
    origin: process.env.FRONTEND_URL ||
        process.env.APP_URL ||
        (process.env.NODE_ENV === "production" ? false : "http://localhost:3000"),
    credentials: true,
    optionsSuccessStatus: 200,
};
// Logging: Diferente formato según entorno
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Health check endpoint
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
    });
});
app.get("/", (_req, res) => res.send({ message: "Bienvenido a la API de Tresa ContaFlow" }));
// Middleware de manejo de errores centralizado (debe ir al final, después de todas las rutas)
app.use((err, _req, res, _next) => {
    // No exponer detalles del error en producción
    const isDevelopment = process.env.NODE_ENV !== "production";
    res.status(500).json({
        error: "Error interno del servidor",
        message: isDevelopment
            ? err.message
            : "Ocurrió un error inesperado. Por favor intenta nuevamente más tarde.",
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