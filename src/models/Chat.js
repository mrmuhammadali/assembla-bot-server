module.exports = (sequelize, DataTypes) => {
  const Chat = sequelize.define('chat', {
    chatId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    access_token: DataTypes.STRING,
    refresh_token: DataTypes.STRING,
    expires_in: DataTypes.INTEGER
  }, {
    timestamps: false
  });

  return Chat;
};