require("dotenv").config();

module.exports = {
  environment: process.env.DATABASE_ENV || "development",
  development: {
    dialect: "sqlite",
    storage:
      process.env.DATABASE_STORAGE ||
      process.env.DATABASE_NAME ||
      "database/house_prices.sqlite",
    logging: process.env.DATABASE_LOGGING === "true",
  },
  test: {
    dialect: "sqlite",
    storage: process.env.DATABASE_TEST_STORAGE || ":memory:",
    logging: false,
  },
  production: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOSTNAME,
    port: process.env.PROD_DB_PORT || 5432,
    dialect: "postgres",
    dialectOptions: {
      bigNumberStrings: true,
    },
  },
};
