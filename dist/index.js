'use strict';

var _routes = require('./routes');

var routes = _interopRequireWildcard(_routes);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

var _services = require('./services');

var _services2 = _interopRequireDefault(_services);

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
var telegram = require('node-telegram-bot-api');

// import Chat from './models'
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/assemblaDb';

var oauth2 = require('simple-oauth2').create(utils.ASSEMBLA_CREDENTIALS);

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


// Chat.getChatById("12345", (err, res) => {
//
//     console.log(res)
//   Chat.integrateSpaceInChat("12345", {_id: "id", spaceName: "dusion"}, (erro, respo) => {
//     console.log("UpdateChatById:", respo)
//     console.log("UpdateChatById:", erro)
//   })
// })


// var bot = new telegram(utils.TELEGRAM_TOKEN, { polling: true });
//
// bot.onText(/\/(.+)/, function (msg, match) {
//   var chatId = msg.chat.id;
//   var COMMANDS = utils.COMMANDS;
//
//   switch (match[1]) {
//
//     case COMMANDS.START:
//     case COMMANDS.HELP:
//       {
//         bot.sendMessage(chatId, '' + utils.MESSAGE.INTRODUCE_BOT);
//         break;
//       }
//
//     case COMMANDS.CONNECT:
//       {
//
//         var AUTHORIZATION_URI = oauth2.authorizationCode.authorizeURL({
//           client_id: utils.ASSEMBLA_CREDENTIALS.client.id,
//           response_type: 'code',
//           state: chatId
//         });
//
//         bot.sendMessage(chatId, '' + utils.MESSAGE.CONNECT + AUTHORIZATION_URI);
//         break;
//       }
//
//     case COMMANDS.NEW_INTEGRATION:
//       {
//         Chat.getChatById(chatId, function (err, chat) {
//           if (!err) {
//             var token = chat.token;
//
//             request({
//               method: 'GET',
//               uri: 'https://api.assembla.com/v1/spaces',
//               auth: {
//                 bearer: token.access_token
//               }
//             }, function (error, response, body) {
//               console.log("Spaces:", body);
//               //TODO send spaces to bot
//             });
//           }
//         });
//       }
//
//     case COMMANDS.LIST_INTEGRATION:
//       {
//         Chat.getChatById(chatId, function (err, chat) {
//           if (!err) {
//             var integrations = chat.integrations;
//           }
//         });
//       }
//
//     default:
//       {
//         bot.sendMessage(chatId, utils.MESSAGE.COMMAND_NOT_FOUND);
//       }
//   }
// });

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