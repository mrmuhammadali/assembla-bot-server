'use strict';

module.exports = function (sequelize, DataTypes) {
  var Integration = sequelize.define('integration', {
    spaceId: DataTypes.STRING,
    spaceName: DataTypes.STRING
  }, {
    timestamps: false
  });

  return Integration;
};