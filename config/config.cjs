require("dotenv").config();

module.exports = {
  development: {
    url: process.env.DATABASE_PUBLIC_URL,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },

  production: {
    url: process.env.DATABASE_PUBLIC_URL,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
