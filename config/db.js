const db = require("../models");

let isConnected = false;

async function connectDatabase() {
  if (isConnected) return db.sequelize;

  await db.sequelize.authenticate();
  console.log("Database connected successfully");

  await db.sequelize.sync();
  isConnected = true;

  return db.sequelize;
}

module.exports = connectDatabase;
