'use strict';

module.exports = function (sequelize, DataTypes) {
  var Chat = sequelize.define('chat', {
    chatId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    access_token: DataTypes.STRING,
    refresh_token: DataTypes.STRING,
    expires_in: DataTypes.INTEGER,
    expires_at: DataTypes.DATE
  }, {
    timestamps: false
  });

  return Chat;
};