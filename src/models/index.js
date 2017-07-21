import {DB_CONFIG_LOCAL} from "../utils"

const Sequelize = require('sequelize');

const DB_CONFIG = DB_CONFIG_LOCAL
console.log("Connection String: ", process.env.MYSQLCONNSTR_localdb)
// const sequelize = new Sequelize(process.env.MYSQLCONNSTR_localdb)
const sequelize = new Sequelize(DB_CONFIG.name, DB_CONFIG.user, DB_CONFIG.password, DB_CONFIG.options)

var models = [
  'Chat',
  'Integration'
];
models.forEach(function(model) {
  module.exports[model] = sequelize.import(__dirname + '/' + model );
});

// describe relationships
(function(m) {
  m.Chat.hasMany(m.Integration, {foreignKey: 'chatId'});
  m.Integration.belongsTo(m.Chat, {foreignKey: 'chatId'});

  sequelize
    .authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });
  sequelize.sync().then(()=>{
    console.log("Successfully synced!!!")
  })
})(module.exports);

// export connection
module.exports.sequelize = sequelize;