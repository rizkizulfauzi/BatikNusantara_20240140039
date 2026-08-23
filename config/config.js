require("dotenv").config();

const development = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: process.env.DB_DIALECT || "postgres",
  logging: false
};

// Mengikuti pola DAY14 untuk environment production di Vercel.
const production = {
  use_env_variable: "POSTGRES_URL",
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false
    }
  }
};

module.exports = {
  development,
  production
};
