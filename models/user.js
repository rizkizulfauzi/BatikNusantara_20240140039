module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "user" }
  }, {
    tableName: "users",
    timestamps: true
  });

  User.associate = (models) => {
    User.hasMany(models.ApiKey, {
      foreignKey: "user_id",
      as: "api_keys",
      onDelete: "CASCADE"
    });
  };

  return User;
};
