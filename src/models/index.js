import {DB_CONFIG} from "../utils"

const Sequelize = require('sequelize');

// const DB_CONFIG = DB_CONFIG_LOCAL

const sequelize = new Sequelize(process.env.DATABASE_URL)
// const sequelize = new Sequelize(DB_CONFIG.name, DB_CONFIG.user, DB_CONFIG.password, DB_CONFIG.options)


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
  sequelize.sync().then(()=>{
    console.log("Successfully synced!!!")
  })
})(module.exports);

// export connection
module.exports.sequelize = sequelize;