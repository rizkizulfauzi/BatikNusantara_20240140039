const db = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = db.User;

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET belum dikonfigurasi.");
  }

  return jwt.sign(
    { id: user.id, nama: user.nama, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

async function register(req, res) {
  try {
    const { nama, email, password } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nama, email, dan password wajib diisi."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password minimal 6 karakter."
      });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email sudah terdaftar."
      });
    }

    const user = await User.create({
      nama,
      email,
      password: await bcrypt.hash(password, 10)
    });

    const token = createToken(user);

    return res.status(201).json({
      success: true,
      message: "Registrasi berhasil.",
      token,
      data: { id: user.id, nama: user.nama, email: user.email, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi."
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah."
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      success: true,
      message: "Login berhasil.",
      token,
      data: { id: user.id, nama: user.nama, email: user.email, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function me(req, res) {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "nama", "email", "role", "createdAt"]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = { register, login, me };
