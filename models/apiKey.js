module.exports = (sequelize, DataTypes) => {
  const ApiKey = sequelize.define("ApiKey", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    nama: { type: DataTypes.STRING(100), allowNull: false },
    key_hash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    key_prefix: { type: DataTypes.STRING(24), allowNull: false },
    plan: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "free" },
    daily_limit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1000 },
    request_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    total_requests: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    last_request_date: { type: DataTypes.DATEONLY, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    last_used_at: { type: DataTypes.DATE, allowNull: true }
  }, {
    tableName: "api_keys",
    timestamps: true
  });

  ApiKey.associate = (models) => {
    ApiKey.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
  };

  return ApiKey;
};
