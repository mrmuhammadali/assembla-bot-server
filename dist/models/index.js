'use strict';

var _utils = require('../utils');

var Sequelize = require('sequelize');

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/assemblaDb';

// const DB_CONFIG = DB_CONFIG_LOCAL
console.log("Connection String: ", mongoUri);
var sequelize = new Sequelize(mongoUri);
// const sequelize = new Sequelize(DB_CONFIG.name, DB_CONFIG.user, DB_CONFIG.password, DB_CONFIG.options)

var models = ['Chat', 'Integration'];
models.forEach(function (model) {
  module.exports[model] = sequelize.import(__dirname + '/' + model);
});

// describe relationships
(function (m) {
  m.Chat.hasMany(m.Integration, { foreignKey: 'chatId' });
  m.Integration.belongsTo(m.Chat, { foreignKey: 'chatId' });

  sequelize.authenticate().then(function () {
    console.log('Connection has been established successfully.');
  }).catch(function (err) {
    console.error('Unable to connect to the database:', err);
  });
  sequelize.sync().then(function () {
    console.log("Successfully synced!!!");
  });
})(module.exports);

// export connection
module.exports.sequelize = sequelize;