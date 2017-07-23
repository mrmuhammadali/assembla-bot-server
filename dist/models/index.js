'use strict';

var _utils = require('../utils');

var Sequelize = require('sequelize');

var uriPostgres = process.env.DATABASE_URL || process.env.HEROKU_POSTGRESQL_ANIMATED_URL || 'postgres://tqrldekflsrwxc:621a00e80cc61917d3b261dd9f9aa39c819793a0634038b2099053fe4ebb57d3@ec2-46-137-97-169.eu-west-1.compute.amazonaws.com:5432/dfkcg96lgv1ob0';

// const DB_CONFIG = DB_CONFIG_LOCAL
console.log("Connection String: ", uriPostgres);
var sequelize = new Sequelize(uriPostgres);
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