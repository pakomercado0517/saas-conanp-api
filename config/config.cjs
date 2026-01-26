require("dotenv").config();

/**
 * Configuración de Sequelize CLI para migraciones
 *
 * Zonas horarias:
 * - Base de datos: UTC
 * - Aplicación: America/Mexico_City
 */
module.exports = {
  development: {
    url: process.env.DATABASE_PUBLIC_URL,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      timezone: "+00:00", // UTC para la base de datos
    },
    timezone: "-06:00", // America/Mexico_City para la aplicación
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: false,
  },

  production: {
    url: process.env.DATABASE_PUBLIC_URL,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      timezone: "+00:00", // UTC para la base de datos
    },
    timezone: "-06:00", // America/Mexico_City para la aplicación
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: false,
  },
};
