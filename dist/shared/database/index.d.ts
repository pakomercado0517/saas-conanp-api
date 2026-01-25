import { Sequelize } from 'sequelize';
/**
 * Configuración de Sequelize para PostgreSQL
 *
 * Zonas horarias:
 * - Base de datos: UTC (America/New_York - Virginia, US)
 * - Aplicación: America/Mexico_City (México)
 *
 * Las fechas se convierten a UTC antes de guardar y a Mexico_City al leer
 */
declare const sequelize: Sequelize;
/**
 * Función para probar la conexión a la base de datos
 */
export declare const testConnection: () => Promise<void>;
export { sequelize };
export default sequelize;
//# sourceMappingURL=index.d.ts.map