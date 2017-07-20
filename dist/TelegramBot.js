'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BotOperations = exports.TelegramBot = undefined;

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

var _mongo = require('./models/mongo');

var _mongo2 = _interopRequireDefault(_mongo);

var _models = require('./models');

var _models2 = _interopRequireDefault(_models);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var request = require('request');
var oauth2 = require('simple-oauth2').create(utils.ASSEMBLA_CREDENTIALS);
var telegram = require('node-telegram-bot-api');

var bot = null;

var TelegramBot = exports.TelegramBot = function TelegramBot() {
  _classCallCheck(this, TelegramBot);

  if (!bot) {
    bot = new telegram(utils.TELEGRAM_TOKEN, { polling: true });
  }
  return bot;
};

var BotOperations =

// Mongodb methods

// handleListIntegrations = (chatId) => {
//   Chat.getChatById(chatId, (err, chat) => {
//     if (!err) {
//       const {integrations} = chat
//       let integrationStr = ''
//       for (let i = 0; i < integrations.length; i++) {
//         integrationStr += `${(i+1)}. ${integrations[i].spaceName}\n`
//       }
//       bot.sendMessage(chatId, integrationStr);
//     }
//   })
// }
//
// handleNewIntegration = (chatId, msg) => {
//   Chat.getChatById(chatId, (err, chat) => {
//     if (!err) {
//       this.fetchSpaces(chatId, msg, chat.token)
//     }
//   })
// }
exports.BotOperations = function BotOperations() {
  var _this = this;

  _classCallCheck(this, BotOperations);

  this.handleCallbackQuery = function (callbackQuery) {
    var data = JSON.parse(callbackQuery.data);
    var space = { _id: data[0], spaceName: data[1] };
    var msg = callbackQuery.message;
    var chat_id = msg.chat.id;

    _mongo2.default.integrateSpaceInChat(chat_id, space, function (err, res) {
      if (!err) {
        var opts = {
          chat_id: chat_id,
          message_id: msg.message_id
        };

        bot.editMessageText('"' + space.spaceName + '"' + utils.MESSAGE.SPACE_INTEGRATED, opts);
      }
    });
  };

  this.handleCommands = function (msg, command) {
    var chatId = msg.chat.id;
    var COMMANDS = utils.COMMANDS;
    switch (command) {
      case COMMANDS.START:
      case COMMANDS.HELP:
        {
          bot.sendMessage(chatId, '' + utils.MESSAGE.INTRODUCE_BOT);
          break;
        }
      case COMMANDS.CONNECT:
        {
          _this.handleConnect(chatId);
          break;
        }
      case COMMANDS.NEW_INTEGRATION:
        {
          _this.handleNewIntegration(chatId, msg);
          break;
        }
      case COMMANDS.LIST_INTEGRATION:
        {
          _this.handleListIntegrations(chatId);
          break;
        }
      case COMMANDS.DELETE_INTEGRATION:
        {
          _this.handleDeleteIntegration();
          break;
        }
      default:
        {
          bot.sendMessage(chatId, utils.MESSAGE.COMMAND_NOT_FOUND);
        }
    }
  };

  this.handleConnect = function (chatId) {
    var AUTHORIZATION_URI = oauth2.authorizationCode.authorizeURL({
      client_id: utils.ASSEMBLA_CREDENTIALS.client.id,
      response_type: 'code',
      state: chatId
    });
    bot.sendMessage(chatId, utils.MESSAGE.CONNECT + AUTHORIZATION_URI);
  };

  this.fetchSpaces = function (chatId, msg, token) {
    var opts = {
      method: 'GET',
      uri: 'https://api.assembla.com/v1/spaces',
      auth: {
        bearer: token.access_token
      }
    };
    request(opts, function (error, response, spaces) {
      spaces = JSON.parse(spaces);
      if (spaces.error) {
        console.log(spaces);
        bot.sendMessage(chatId, utils.MESSAGE.INVALID_TOKEN);
      } else {
        var names = [];
        for (var i = 0; i < spaces.length; i++) {
          var spaceId = spaces[i].id;
          var spaceName = spaces[i].name;
          var data = JSON.stringify([spaceId, spaceName]);

          names.push([{ text: spaceName, callback_data: data }]);
        }

        var _opts = {
          reply_to_message_id: msg.message_id,
          reply_markup: {
            inline_keyboard: names
          }
        };
        bot.sendMessage(chatId, utils.MESSAGE.CHOOSE_SAPCE, _opts);
      }
    });
  };

  this.handleNewIntegration = function (chatId, msg) {
    _models2.default.Chat.findOne({ where: { chatId: chatId } }).then(function (chat) {
      console.log(chat.dataValues);
      _this.fetchSpaces(chatId, msg, chat.dataValues);
    });
  };
};