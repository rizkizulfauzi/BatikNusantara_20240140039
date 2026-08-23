require("dotenv").config();

const db = require("../models");
const batikData = require("./batikData");

async function seed() {
  try {
    await db.sequelize.authenticate();
    console.log("Database connected successfully");

    await db.sequelize.sync();
    console.log("Database synchronized");

    for (const item of batikData) {
      await db.Batik.upsert(item);
    }

    const total = await db.Batik.count();

    console.log(`Seed selesai. Total data batik: ${total}`);
    console.log("Tabel tersedia: users, api_keys, batiks");
  } catch (error) {
    console.error("Seed gagal:", error.message);
    process.exitCode = 1;
  } finally {
    await db.sequelize.close();
  }
}

seed();
