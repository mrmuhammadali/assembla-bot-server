'use strict';

var _utils = require('../utils');

var Sequelize = require('sequelize');

var DB_CONFIG = _utils.DB_CONFIG_LOCAL;

var sequelize = new Sequelize(DB_CONFIG.name, DB_CONFIG.user, DB_CONFIG.password, DB_CONFIG.options);

var models = ['Chat', 'Integration'];
models.forEach(function (model) {
  module.exports[model] = sequelize.import(__dirname + '/' + model);
});

// describe relationships
(function (m) {
  m.Chat.hasMany(m.Integration, { foreignKey: 'chatId' });
  sequelize.sync().then(function () {
    console.log("Successfully synced!!!");
  });
})(module.exports);

// export connection
module.exports.sequelize = sequelize;