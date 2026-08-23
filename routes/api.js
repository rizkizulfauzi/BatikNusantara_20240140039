const express = require("express");
const router = express.Router();

const authController = require("../controller/authController");
const apiKeyController = require("../controller/apiKeyController");
const batikController = require("../controller/batikController");
const authMiddleware = require("../middleware/authMiddleware");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.me);

router.post("/keys", authMiddleware, apiKeyController.create);
router.get("/keys", authMiddleware, apiKeyController.getAll);
router.delete("/keys/:id", authMiddleware, apiKeyController.remove);

// Client membaca data menggunakan API key.
router.get("/batik", apiKeyMiddleware, batikController.getAll);
router.get("/batik/stats", apiKeyMiddleware, batikController.stats);
router.get("/batik/:id", apiKeyMiddleware, batikController.getById);

// User yang sudah login mengelola data menggunakan JWT.
router.post("/batik", authMiddleware, batikController.create);
router.put("/batik/:id", authMiddleware, batikController.update);
router.delete("/batik/:id", authMiddleware, batikController.remove);

module.exports = router;
