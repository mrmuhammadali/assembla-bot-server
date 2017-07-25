'use strict';

var _routes = require('./routes');

var routes = _interopRequireWildcard(_routes);

var _services = require('./services');

var _services2 = _interopRequireDefault(_services);

var _models = require('./models');

var _models2 = _interopRequireDefault(_models);

var _utils = require('./utils');

var _TelegramBot = require('./TelegramBot');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var bodyParser = require('body-parser');
var feathers = require('feathers');
var featherClient = require('feathers/client');
var io = require('socket.io-client');
var socketio = require('feathers-socketio');
var socketioClient = require('feathers-socketio/client');

var app = feathers().use(bodyParser.json()).use('/callback', routes.authCallback).configure(socketio()).configure(_services2.default);

app.get('/', function (req, res) {
  res.redirect(_utils.TELEGRAM_BOT_URL);
});

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

var bot = new _TelegramBot.TelegramBot();
var botOperations = new _TelegramBot.BotOperations();
bot.onText(/\/(.+)/, function (msg, match) {
  var command = match[1].substr(0, match[1].indexOf('@'));
  if (command === "") {
    command = match[1];
  }
  botOperations.handleCommands(msg, command);
});

bot.on('callback_query', function (callbackQuery) {
  botOperations.handleCallbackQuery(callbackQuery);
});

var date = new Date();
var millis = 100;
setInterval(function () {
  millis = 90000;
  _models2.default.Integration.findAll({ include: [_models2.default.Chat] }).then(function (res) {
    if (res !== null) {
      for (var i = 0; i < res.length; i++) {
        var integration = res[i].dataValues;
        var chat = integration.chat.dataValues;
        var chatId = chat.chatId,
            access_token = chat.access_token,
            refresh_token = chat.refresh_token,
            expires_at = chat.expires_at;


        if (date.getTime() > expires_at.getTime()) {
          botOperations.refreshToken(chatId, integration.spaceId, date, refresh_token);
        } else {
          botOperations.fetchActivity(chatId, integration.spaceId, date, access_token);
        }

        date = new Date();
        console.log("Space Id " + i + ": ", integration.spaceId);
      }
    }
  });
}, millis);

// /spaces/cTOCMCa_4r57Jddmr6CpXy

app.listen(process.env.PORT || 3030, function () {
  console.log('Assembla Bot Server started at port: ' + (process.env.PORT || 3030));
});

//git push https://git.heroku.com/assembla-bot-server.git master