const { Op, fn, col } = require("sequelize");
const db = require("../models");

const Batik = db.Batik;

const ALLOWED_SORTS = [
  "nama",
  "provinsi",
  "daerah",
  "estimasi_hari_pembuatan",
  "createdAt"
];

const EDITABLE_FIELDS = [
  "kode",
  "slug",
  "nama",
  "daerah",
  "kota_asal",
  "provinsi",
  "pulau",
  "kategori_motif",
  "motif_utama",
  "warna_dominan",
  "warna_sekunder",
  "gaya_batik",
  "filosofi",
  "makna",
  "teknik_pembuatan",
  "bahan_kain",
  "tingkat_kerumitan",
  "estimasi_hari_pembuatan",
  "penggunaan_tradisional",
  "is_warisan_tradisional",
  "deskripsi"
];

const REQUIRED_CREATE_FIELDS = [
  "kode",
  "nama",
  "daerah",
  "kota_asal",
  "provinsi",
  "pulau",
  "kategori_motif",
  "motif_utama",
  "warna_dominan",
  "gaya_batik",
  "filosofi",
  "makna",
  "teknik_pembuatan",
  "bahan_kain",
  "tingkat_kerumitan",
  "estimasi_hari_pembuatan",
  "penggunaan_tradisional",
  "deskripsi"
];

function slugify(text = "") {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function pickEditable(body) {
  const data = {};
  for (const field of EDITABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      data[field] = body[field];
    }
  }
  return data;
}

function sendSequelizeError(res, error) {
  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      success: false,
      message: "Kode atau slug batik sudah digunakan."
    });
  }

  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: error.errors?.[0]?.message || "Data batik tidak valid."
    });
  }

  return res.status(500).json({ success: false, message: error.message });
}

async function getAll(req, res) {
  try {
    const {
      search, provinsi, daerah, pulau, kategori_motif, teknik_pembuatan,
      warna_dominan, tingkat_kerumitan, tradisional,
      sort = "nama", order = "asc", page = 1, limit = 10
    } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { nama: { [Op.iLike]: `%${search}%` } },
        { motif_utama: { [Op.iLike]: `%${search}%` } },
        { filosofi: { [Op.iLike]: `%${search}%` } },
        { deskripsi: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (provinsi) where.provinsi = { [Op.iLike]: provinsi };
    if (daerah) where.daerah = { [Op.iLike]: daerah };
    if (pulau) where.pulau = { [Op.iLike]: pulau };
    if (kategori_motif) where.kategori_motif = { [Op.iLike]: kategori_motif };
    if (teknik_pembuatan) where.teknik_pembuatan = { [Op.iLike]: teknik_pembuatan };
    if (warna_dominan) where.warna_dominan = { [Op.iLike]: `%${warna_dominan}%` };
    if (tingkat_kerumitan) where.tingkat_kerumitan = tingkat_kerumitan;

    if (tradisional === "true" || tradisional === "false") {
      where.is_warisan_tradisional = tradisional === "true";
    }

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    const sortColumn = ALLOWED_SORTS.includes(sort) ? sort : "nama";
    const sortOrder = order.toLowerCase() === "desc" ? "DESC" : "ASC";

    const { count, rows } = await Batik.findAndCountAll({
      where,
      order: [[sortColumn, sortOrder]],
      limit: parsedLimit,
      offset: (parsedPage - 1) * parsedLimit
    });

    return res.status(200).json({
      success: true,
      meta: {
        page: parsedPage,
        limit: parsedLimit,
        total: count,
        total_pages: Math.ceil(count / parsedLimit),
        api_plan: req.apiKey.plan,
        daily_limit: req.apiKey.daily_limit,
        request_used_today: req.apiKey.request_count,
        request_remaining: Math.max(req.apiKey.daily_limit - req.apiKey.request_count, 0)
      },
      data: rows
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getById(req, res) {
  try {
    const batik = await Batik.findByPk(req.params.id);

    if (!batik) {
      return res.status(404).json({ success: false, message: "Data batik tidak ditemukan." });
    }

    return res.status(200).json({ success: true, data: batik });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function create(req, res) {
  try {
    const missing = REQUIRED_CREATE_FIELDS.filter(
      (field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === ""
    );

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Field wajib belum diisi: ${missing.join(", ")}`
      });
    }

    const data = pickEditable(req.body);
    data.slug = req.body.slug ? slugify(req.body.slug) : slugify(req.body.nama);

    const batik = await Batik.create(data);

    return res.status(201).json({
      success: true,
      message: "Data batik berhasil ditambahkan.",
      data: batik
    });
  } catch (error) {
    return sendSequelizeError(res, error);
  }
}

async function update(req, res) {
  try {
    const batik = await Batik.findByPk(req.params.id);

    if (!batik) {
      return res.status(404).json({ success: false, message: "Data batik tidak ditemukan." });
    }

    const data = pickEditable(req.body);

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada field yang dikirim untuk diperbarui."
      });
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "slug")) {
      data.slug = slugify(req.body.slug);
    } else if (Object.prototype.hasOwnProperty.call(req.body, "nama")) {
      data.slug = slugify(req.body.nama);
    }

    await batik.update(data);

    return res.status(200).json({
      success: true,
      message: "Data batik berhasil diperbarui.",
      data: batik
    });
  } catch (error) {
    return sendSequelizeError(res, error);
  }
}

async function remove(req, res) {
  try {
    const batik = await Batik.findByPk(req.params.id);

    if (!batik) {
      return res.status(404).json({ success: false, message: "Data batik tidak ditemukan." });
    }

    await batik.destroy();

    return res.status(200).json({
      success: true,
      message: "Data batik berhasil dihapus."
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function stats(req, res) {
  try {
    const total = await Batik.count();

    const byProvince = await Batik.findAll({
      attributes: ["provinsi", [fn("COUNT", col("id")), "jumlah"]],
      group: ["provinsi"],
      order: [[fn("COUNT", col("id")), "DESC"]],
      raw: true
    });

    const byTechnique = await Batik.findAll({
      attributes: ["teknik_pembuatan", [fn("COUNT", col("id")), "jumlah"]],
      group: ["teknik_pembuatan"],
      order: [[fn("COUNT", col("id")), "DESC"]],
      raw: true
    });

    const byCategory = await Batik.findAll({
      attributes: ["kategori_motif", [fn("COUNT", col("id")), "jumlah"]],
      group: ["kategori_motif"],
      order: [[fn("COUNT", col("id")), "DESC"]],
      raw: true
    });

    return res.status(200).json({
      success: true,
      data: {
        total_batik: total,
        berdasarkan_provinsi: byProvince,
        berdasarkan_teknik: byTechnique,
        berdasarkan_kategori: byCategory
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = { getAll, getById, create, update, remove, stats };
