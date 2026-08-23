const crypto = require("crypto");
const db = require("../models");

const ApiKey = db.ApiKey;

function generateApiKey() {
  return `rb_live_${crypto.randomBytes(24).toString("hex")}`;
}

function hashApiKey(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

async function create(req, res) {
  try {
    const { nama } = req.body;

    if (!nama) {
      return res.status(400).json({ success: false, message: "Nama API key wajib diisi." });
    }

    const activeCount = await ApiKey.count({
      where: { user_id: req.user.id, is_active: true }
    });

    if (activeCount >= 5) {
      return res.status(400).json({
        success: false,
        message: "Free plan maksimal memiliki 5 API key aktif."
      });
    }

    const rawKey = generateApiKey();
    const apiKey = await ApiKey.create({
      user_id: req.user.id,
      nama,
      key_hash: hashApiKey(rawKey),
      key_prefix: rawKey.slice(0, 18),
      plan: "free",
      daily_limit: 1000
    });

    return res.status(201).json({
      success: true,
      message: "API key berhasil dibuat. Simpan key ini karena hanya ditampilkan sekali.",
      api_key: rawKey,
      data: {
        id: apiKey.id,
        nama: apiKey.nama,
        key_prefix: apiKey.key_prefix,
        plan: apiKey.plan,
        daily_limit: apiKey.daily_limit
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getAll(req, res) {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const keys = await ApiKey.findAll({
      where: { user_id: req.user.id },
      attributes: [
        "id", "nama", "key_prefix", "plan", "daily_limit", "request_count",
        "total_requests", "last_request_date", "is_active", "last_used_at", "createdAt"
      ],
      order: [["createdAt", "DESC"]]
    });

    const data = keys.map((key) => {
      const item = key.toJSON();

      // Jika belum dipakai hari ini, penggunaan hari ini dianggap 0.
      if (item.last_request_date !== today) {
        item.request_count = 0;
      }

      return item;
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function remove(req, res) {
  try {
    const apiKey = await ApiKey.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!apiKey) {
      return res.status(404).json({ success: false, message: "API key tidak ditemukan." });
    }

    await apiKey.update({ is_active: false });

    return res.status(200).json({
      success: true,
      message: "API key berhasil dinonaktifkan."
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = { create, getAll, remove };
