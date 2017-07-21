'use strict';

var _routes = require('./routes');

var routes = _interopRequireWildcard(_routes);

var _services = require('./services');

var _services2 = _interopRequireDefault(_services);

var _models = require('./models');

var _models2 = _interopRequireDefault(_models);

var _TelegramBot = require('./TelegramBot');

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

var date = new Date();

setInterval(function () {
  _models2.default.Integration.findAll({ include: [_models2.default.Chat] }).then(function (res) {
    if (res !== null) {
      for (var i = 0; i < res.length; i++) {
        var integration = res[i].dataValues;
        var chat = integration.chat.dataValues;

        new _TelegramBot.BotOperations().fetchActivity(chat.chatId, integration.spaceId, date, chat.access_token);
        date = new Date();
        console.log("Data " + i + ": ", integration.spaceId);
      }
    }
  });
}, 60000);

// token.token.access_token
// /spaces/cTOCMCa_4r57Jddmr6CpXy

app.listen(process.env.PORT || 3030, function () {
  console.log('Assembla Bot Server started at port: ' + (process.env.PORT || 3030));
});

//git push https://git.heroku.com/assembla-bot-server.git master