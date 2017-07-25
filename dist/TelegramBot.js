'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BotOperations = exports.TelegramBot = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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
var dateFormat = require('dateformat');

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

  this.insertIntegration = function (chatId, message_id, spaceId, spaceName) {

    var opts = { chat_id: chatId, message_id: message_id };

    _models2.default.Integration.findOne({ where: { chatId: chatId, spaceId: spaceId } }).then(function (res) {
      if (res === null) {
        _models2.default.Integration.create({ spaceId: spaceId, spaceName: spaceName, chatId: chatId }).then(function (res) {
          bot.editMessageText('"' + spaceName + '"' + utils.MESSAGE.SPACE_INTEGRATED, opts);
          return;
        }).catch(function (err) {
          bot.editMessageText(utils.MESSAGE.DATABASE_ERROR, opts);
        });
      } else {
        bot.editMessageText(utils.MESSAGE.SPACE_ALREADY_EXIST, opts);
      }
    });
  };

  this.deleteIntegration = function (chatId, message_id, spaceId, spaceName) {
    var opts = { chat_id: chatId, message_id: message_id };

    _models2.default.Integration.destroy({ where: { chatId: chatId, spaceId: spaceId } }).then(function (res) {
      if (res >= 1) {
        bot.editMessageText('"' + spaceName + '"' + utils.MESSAGE.SPACE_DELETED, opts);
      } else {
        bot.editMessageText(utils.MESSAGE.DATABASE_ERROR, opts);
      }
    }).catch(function (err) {
      bot.editMessageText(utils.MESSAGE.DATABASE_ERROR, opts);
    });
  };

  this.handleCallbackQuery = function (callbackQuery) {
    var msg = callbackQuery.message;
    var action = msg.reply_to_message.text.substr(1);
    var chat_id = msg.chat.id;
    var data = JSON.parse(callbackQuery.data);
    var spaceId = data[0];
    var spaceName = data[1];

    switch (action) {
      case utils.COMMANDS.NEW_INTEGRATION:
        {
          _this.insertIntegration(chat_id, msg.message_id, spaceId, spaceName);
          break;
        }
      case utils.COMMANDS.DELETE_INTEGRATION:
        {
          _this.deleteIntegration(chat_id, msg.message_id, spaceId, spaceName);
          break;
        }
    }

    // const space = {_id: data[0], spaceName: data[1]}
    //
    // Chat.integrateSpaceInChat(chat_id, space, (err, res) => {
    //   if (!err) {
    //     const opts = {
    //       chat_id,
    //       message_id: msg.message_id,
    //     };
    //
    //     bot.editMessageText(`"${space.spaceName}"` + utils.MESSAGE.SPACE_INTEGRATED, opts);
    //   }
    // })
  };

  this.handleCommands = function (msg, command) {
    var chatId = msg.chat.id;
    var COMMANDS = utils.COMMANDS;
    switch (command) {
      case COMMANDS.START:
      case COMMANDS.HELP:
        {
          bot.sendMessage(chatId, utils.MESSAGE.INTRODUCE_BOT);
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
          _this.handleListIntegrations(chatId, msg.message_id);
          break;
        }
      case COMMANDS.DELETE_INTEGRATION:
        {
          _this.handleDeleteIntegration(chatId, msg.message_id);
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
        bot.sendMessage(chatId, utils.MESSAGE.CHOOSE_SAPCE_INTEGRATE, _opts);
      }
    });
  };

  this.handleNewIntegration = function (chatId, msg) {
    _models2.default.Chat.findOne({ where: { chatId: chatId } }).then(function (chat) {
      console.log(chat.dataValues);
      _this.fetchSpaces(chatId, msg, chat.dataValues);
    });
  };

  this.handleListIntegrations = function (chatId, messageId) {
    _models2.default.Integration.findAll({ where: { chatId: chatId } }).then(function (integrations) {
      if (integrations !== null) {
        var integrationStr = '';
        for (var i = 0; i < integrations.length; i++) {
          console.log(integrations[i].dataValues.spaceName);
          integrationStr += i + 1 + '. ' + integrations[i].dataValues.spaceName + '\n';
        }
        bot.sendMessage(chatId, utils.MESSAGE.LIST_INTEGRATION + integrationStr, { reply_to_message_id: messageId });
      }
    });
  };

  this.handleDeleteIntegration = function (chatId, messageId) {
    _models2.default.Integration.findAll({ where: { chatId: chatId } }).then(function (integrations) {
      if (integrations !== null) {
        var names = [];
        for (var i = 0; i < integrations.length; i++) {
          var _integrations$i$dataV = integrations[i].dataValues,
              spaceId = _integrations$i$dataV.spaceId,
              spaceName = _integrations$i$dataV.spaceName;

          var data = JSON.stringify([spaceId, spaceName]);

          names.push([{ text: spaceName, callback_data: data }]);
        }

        var opts = {
          reply_to_message_id: messageId,
          reply_markup: {
            inline_keyboard: names
          }
        };
        bot.sendMessage(chatId, utils.MESSAGE.CHOOSE_SAPCE_DELETE, opts);
      }
    });
  };

  this.appendZero = function (num) {
    if (num < 10) {
      return '0' + num;
    }
    return num;
  };

  this.refreshToken = function (chatId, spaceId, date, refresh_token) {
    console.log("Expired!!!!!!");
    var opts = {
      method: 'POST',
      uri: utils.REFRESH_TOKEN_URI + refresh_token
    };
    request(opts, function (error, response, token) {
      console.log("Token Error: ", error);
      if (token !== null) {
        token = JSON.parse(token);
        token = oauth2.accessToken.create(token);

        var _token$token = _extends({}, token.token),
            access_token = _token$token.access_token,
            expires_at = _token$token.expires_at;

        console.log("New Token: ", _extends({}, token.token));
        _models2.default.Chat.update({ access_token: access_token, expires_at: expires_at }, { where: { chatId: chatId } });
        _this.fetchActivity(chatId, spaceId, date, access_token);
      }
    });
  };

  this.fetchActivity = function (chatId, spaceId, date, access_token) {
    // let dateStr = `${date.getFullYear()}-${this.appendZero((date.getMonth() + 1))}-`
    // dateStr += `${this.appendZero(date.getUTCDate())} ${this.appendZero(date.getUTCHours())}:${this.appendZero(date.getUTCMinutes())}`

    var opts = {
      method: 'GET',
      uri: 'https://api.assembla.com/v1/activity.json?space_id=' + spaceId + '&from=' + dateFormat(date, 'yyyy-mm-dd\' \'HH:MM'),
      auth: {
        bearer: access_token
      }
    };
    request(opts, function (error, response, activity) {
      try {
        activity = JSON.parse(activity);
        if (activity.error) {
          console.log(activity);
          bot.sendMessage(chatId, utils.MESSAGE.INVALID_TOKEN);
        } else {
          for (var i = 0; i < activity.length; i++) {
            var _activity$i = activity[i],
                _date = _activity$i.date,
                author_name = _activity$i.author_name,
                space_name = _activity$i.space_name,
                operation = _activity$i.operation,
                title = _activity$i.title,
                object = _activity$i.object;

            var str = object + ': ' + dateFormat(_date, 'mmm d, yy \'@\' HH:MM') + '\n' + author_name + ' ' + operation + ' \'' + title + '\' in \'' + space_name + '\'';
            console.log("Request Response: ", str);
            bot.sendMessage(chatId, str);
          }
        }
      } catch (e) {}
    });
  };
};