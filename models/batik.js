module.exports = (sequelize, DataTypes) => {
  const Batik = sequelize.define("Batik", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    kode: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    slug: { type: DataTypes.STRING(160), allowNull: false, unique: true },
    nama: { type: DataTypes.STRING(150), allowNull: false },
    daerah: { type: DataTypes.STRING(100), allowNull: false },
    kota_asal: { type: DataTypes.STRING(100), allowNull: false },
    provinsi: { type: DataTypes.STRING(100), allowNull: false },
    pulau: { type: DataTypes.STRING(50), allowNull: false },
    kategori_motif: { type: DataTypes.STRING(100), allowNull: false },
    motif_utama: { type: DataTypes.STRING(120), allowNull: false },
    warna_dominan: { type: DataTypes.STRING(80), allowNull: false },
    warna_sekunder: { type: DataTypes.STRING(80), allowNull: true },
    gaya_batik: { type: DataTypes.STRING(80), allowNull: false },
    filosofi: { type: DataTypes.TEXT, allowNull: false },
    makna: { type: DataTypes.TEXT, allowNull: false },
    teknik_pembuatan: { type: DataTypes.STRING(80), allowNull: false },
    bahan_kain: { type: DataTypes.STRING(80), allowNull: false },
    tingkat_kerumitan: {
      type: DataTypes.ENUM("mudah", "sedang", "rumit", "sangat_rumit"),
      allowNull: false
    },
    estimasi_hari_pembuatan: { type: DataTypes.INTEGER, allowNull: false },
    penggunaan_tradisional: { type: DataTypes.STRING(120), allowNull: false },
    is_warisan_tradisional: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    deskripsi: { type: DataTypes.TEXT, allowNull: false }
  }, {
    tableName: "batiks",
    timestamps: true,
    indexes: [
      { fields: ["provinsi"] },
      { fields: ["daerah"] },
      { fields: ["kategori_motif"] },
      { fields: ["teknik_pembuatan"] }
    ]
  });

  return Batik;
};
