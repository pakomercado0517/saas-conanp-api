import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_PUBLIC_URL) {
  throw new Error('DATABASE_PUBLIC_URL no está definida en las variables de entorno');
}

const sequelize = new Sequelize(process.env.DATABASE_PUBLIC_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },
});

export { sequelize };
export default sequelize;
