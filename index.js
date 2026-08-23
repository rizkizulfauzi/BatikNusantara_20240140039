require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDatabase = require("./config/db");

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let databaseReady = false;
let databasePromise = null;

app.use(async (req, res, next) => {
  try {
    if (!databaseReady) {
      if (!databasePromise) {
        databasePromise = connectDatabase();
      }

      await databasePromise;
      databaseReady = true;
    }

    next();
  } catch (error) {
    console.error("Database initialization failed:", error.message);
    databasePromise = null;

    return res.status(500).json({
      success: false,
      message: "Database initialization failed."
    });
  }
});

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    service: "Ragam Batik",
    database: "connected"
  });
});

app.use("/api", require("./routes/api"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/docs", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "docs.html"));
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route tidak ditemukan."
  });
});

// Tetap bisa dijalankan lokal dengan npm run dev / npm start.
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Ragam Batik berjalan di http://localhost:${PORT}`);
  });
}

// Pola seperti DAY14: Express app diekspor langsung untuk Vercel.
module.exports = app;
