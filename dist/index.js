import app from "./server.js";
import { testConnection } from "./shared/database/index.js";
const port = parseInt(process.env["PORT"] || "3001");
const server = async () => {
    try {
        // Probar conexión a la base de datos antes de iniciar el servidor
        await testConnection();
        app.listen(port, () => {
            console.log(`🚀 Servidor corriendo en el puerto ${port}`);
            console.log(`📊 Entorno: ${process.env["NODE_ENV"] || "development"}`);
        });
    }
    catch (error) {
        console.error("❌ Error al iniciar el servidor:", error);
        process.exit(1);
    }
};
void server();
//# sourceMappingURL=index.js.map