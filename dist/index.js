'use strict';

var _routes = require('./routes');

var routes = _interopRequireWildcard(_routes);

var _services = require('./services');

var _services2 = _interopRequireDefault(_services);

var _TelegramBot = require('./TelegramBot');

var _models = require('./models');

var _models2 = _interopRequireDefault(_models);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var bodyParser = require('body-parser');
var feathers = require('feathers');
var featherClient = require('feathers/client');
var io = require('socket.io-client');
var mongoose = require('mongoose');
var request = require('request');
var socketio = require('feathers-socketio');
var socketioClient = require('feathers-socketio/client');

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/assemblaDb';

var app = feathers().use(bodyParser.json()).use('/callback', routes.authCallback).configure(socketio()).configure(_services2.default);

var sequelize = require('sequelize-heroku').connect();

if (sequelize) {
  sequelize.authenticate().then(function () {
    var config = sequelize.connectionManager.config;
    console.log('sequelize-heroku: Connected to ' + config.host + ' as ' + config.username + '.');

    sequelize.query('SELECT 1+1 as test').then(function (res) {

      console.log('1+1=' + res[0].test);
    });
  }).catch(function (err) {
    var config = sequelize.connectionManager.config;
    console.log('Sequelize: Error connecting ' + config.host + ' as ' + config.user + ': ' + err);
  });
} else {
  console.log('No environnement variable found.');
}

// sequelize.sync({force: true})
//   .then(() => {
//   Chat.create({
//     chatId: 23,
//
//   })
//
//     const dt = {
//       spaceId: '123',
//       spaceName: 'Space',
//       chatId: 23
//     }
//     // Integration.beforeCreate((dt) => {
//     //
//     //
//     //
//     // })
//     Integration.create(dt)
//       .then((res) => {
//         console.log("RES:", res)
//       })
//       .catch((err) => {
//         console.log("eroooor:", err)
//       })
//   })
// const socket = io('http://localhost:3000/');
// const client = featherClient();
//
// // Set up Socket.io client with the socket
// client.configure(socketioClient(socket));

// app.service('users').get('cTOCMCa_4r57Jddmr6CpXy')

// client.service('users').get(`cTOCMCa_4r57Jddmr6CpXy`)
// socket.emit('users::get', `cTOCMCa_4r57Jddmr6CpXy`, { fetch: 'all' }, (error, message) => {
//   console.log('Found message', message);
// });

// mongoose.connect(mongoUri)
//
// mongoose.connection.on('connected', () => {
//   console.log("Connected to database")
// })
var bot = new _TelegramBot.TelegramBot();
bot.onText(/\/(.+)/, function (msg, match) {
  new _TelegramBot.BotOperations().handleCommands(msg, match[1]);
});

bot.on('callback_query', function (callbackQuery) {
  new _TelegramBot.BotOperations().handleCallbackQuery(callbackQuery);
});

// token.token.access_token
// /spaces/cTOCMCa_4r57Jddmr6CpXy
app.get('/spaces', function (req, res) {
  var space_id = req.query.space_id;

  request({
    method: 'GET',
    uri: 'https://api.assembla.com/v1/activity.json?space_id=' + space_id,
    auth: {
      bearer: 'b68c758499f479102aa6a81f478237e3'
    }
  }, function (error, response, body) {
    //this contains a json object of all the user's spaces
    console.log("Response Body(Assembla): ", body);
    console.log(req.query);
    res.send(body);
  });
});

app.listen(process.env.PORT || 3030, function () {
  console.log('Assembla Bot Server started at port: ' + (process.env.PORT || 3030));
});

//git push https://git.heroku.com/assembla-bot-server.git master