'use strict';

module.exports = function (sequelize, DataTypes) {
  var Chat = sequelize.define('chat', {
    chatId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    access_token: DataTypes.STRING,
    refresh_token: DataTypes.STRING
  }, {
    timestamps: false
  });

  return Chat;
};