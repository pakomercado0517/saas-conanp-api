import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env['DATABASE_PUBLIC_URL']) {
  throw new Error('DATABASE_PUBLIC_URL no está definida en las variables de entorno');
}

/**
 * Configuración de Sequelize para PostgreSQL
 * 
 * Zonas horarias:
 * - Base de datos: UTC (America/New_York - Virginia, US)
 * - Aplicación: America/Mexico_City (México)
 * 
 * Las fechas se convierten a UTC antes de guardar y a Mexico_City al leer
 */
const sequelize = new Sequelize(process.env['DATABASE_PUBLIC_URL'], {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
    // Configurar timezone de la base de datos a UTC
    timezone: '+00:00',
  },
  // Timezone de la aplicación (México)
  timezone: '-06:00', // America/Mexico_City (UTC-6, puede variar con DST)
  logging: process.env['NODE_ENV'] === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },
  pool: {
    max: 10, // Máximo de conexiones en el pool
    min: 0, // Mínimo de conexiones en el pool
    acquire: 30000, // Tiempo máximo (ms) para obtener una conexión
    idle: 10000, // Tiempo máximo (ms) que una conexión puede estar idle antes de ser liberada
  },
  // Validar conexión al inicializar
  retry: {
    max: 3, // Intentar reconectar máximo 3 veces
  },
});

/**
 * Función para probar la conexión a la base de datos
 */
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    throw error;
  }
};

export { sequelize };
export default sequelize;
