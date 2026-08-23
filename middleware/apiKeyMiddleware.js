const crypto = require("crypto");
const db = require("../models");

const ApiKey = db.ApiKey;

function hashApiKey(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

module.exports = async function apiKeyMiddleware(req, res, next) {
  try {
    const rawKey = req.headers["x-api-key"];

    if (!rawKey) {
      return res.status(401).json({
        success: false,
        message: "API key wajib dikirim melalui header x-api-key."
      });
    }

    const apiKey = await ApiKey.findOne({
      where: {
        key_hash: hashApiKey(rawKey),
        is_active: true
      }
    });

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: "API key tidak valid atau sudah dinonaktifkan."
      });
    }

    const today = new Date().toISOString().slice(0, 10);

    // Karena tidak memakai tabel api_usage, hitungan harian disimpan langsung
    // pada tabel api_keys. Saat tanggal berganti, counter di-reset.
    let usedToday = apiKey.request_count;

    if (apiKey.last_request_date !== today) {
      usedToday = 0;
    }

    if (usedToday >= apiKey.daily_limit) {
      return res.status(429).json({
        success: false,
        message: "Batas request harian API key sudah tercapai.",
        limit: apiKey.daily_limit
      });
    }

    await apiKey.update({
      request_count: usedToday + 1,
      total_requests: apiKey.total_requests + 1,
      last_request_date: today,
      last_used_at: new Date()
    });

    req.apiKey = apiKey;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memvalidasi API key.",
      error: error.message
    });
  }
};
