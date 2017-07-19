'use strict';

var _utils = require('../utils');

var Sequelize = require('sequelize');

// const DB_CONFIG = DB_CONFIG_LOCAL
console.log(process.env.DATABASE_URL);
// const sequelize = new Sequelize(process.env.DATABASE_URL)
var sequelize = new Sequelize(process.env.DATABASE_URL, _utils.DB_CONFIG.options);

var models = ['Chat', 'Integration'];
models.forEach(function (model) {
  module.exports[model] = sequelize.import(__dirname + '/' + model);
});

// describe relationships
(function (m) {
  m.Chat.hasMany(m.Integration, { foreignKey: 'chatId' });
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