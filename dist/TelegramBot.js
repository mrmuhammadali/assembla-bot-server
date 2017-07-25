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

// longPolling = () => {
//   models.Integration.findAll({ include: [models.Chat]})
//     .then(res => {
//       if (res !== null) {
//         for (let i = 0; i < res.length; i++) {
//           const integration = res[i].dataValues
//           const chat = integration.chat.dataValues
//           const {chatId, access_token, refresh_token, expires_at} = chat
//
//           if (date.getTime() > expires_at.getTime()) {
//             this.refreshToken(chatId, integration.spaceId, date, refresh_token)
//           } else {
//             this.fetchActivity(chatId, integration.spaceId, date, access_token)
//           }
//
//           date = new Date()
//           console.log("Space Id "+i+": ", integration.spaceId)
//         }
//       }
//     })
// }

// fetchActivity = (chatId, spaceId, date, access_token) => {
//   const opts = {
//     method: 'GET',
//     uri: `https://api.assembla.com/v1/activity.json?space_id=${spaceId}&from=${dateFormat(date, `yyyy-mm-dd' 'HH:MM`)}`,
//     auth: {
//       bearer: access_token
//     }
//   }
//   request(opts, (error, response, activity) => {
//     try {
//       activity = JSON.parse(activity)
//       if (activity.error) {
//         console.log(activity)
//         bot.sendMessage(chatId, utils.MESSAGE.INVALID_TOKEN);
//       } else {
//         for (let i = 0; i < activity.length; i++) {
//           const {date, author_name, space_name, operation, title, object} = activity[i]
//           const str = `${object}: ${dateFormat(date, `mmm d, yy '@' HH:MM`)}\n${author_name} ${operation} '${title}' in '${space_name}'`
//           console.log("Request Response: ", str)
//           bot.sendMessage(chatId, str);
//         }
//       }
//     }
//     catch (e) {
//
//     }
//   });
// }

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

  this.insertIntegration = function (chatId, message_id, spaceWikiName, spaceName) {

    var opts = { chat_id: chatId, message_id: message_id };

    _models2.default.Integration.findOne({ where: { chatId: chatId, spaceWikiName: spaceWikiName } }).then(function (res) {
      if (res === null) {
        _models2.default.Integration.create({ spaceWikiName: spaceWikiName, spaceName: spaceName, chatId: chatId }).then(function (res) {
          bot.editMessageText('"' + spaceName + '"' + utils.MESSAGE.SPACE_INTEGRATED, opts);
        }).catch(function (err) {
          bot.editMessageText(utils.MESSAGE.DATABASE_ERROR, opts);
        });
      } else {
        bot.editMessageText(utils.MESSAGE.SPACE_ALREADY_EXIST, opts);
      }
    });
  };

  this.deleteIntegration = function (chatId, message_id, spaceWikiName, spaceName) {
    var opts = { chat_id: chatId, message_id: message_id };

    _models2.default.Integration.destroy({ where: { chatId: chatId, spaceWikiName: spaceWikiName } }).then(function (res) {
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
    var chat_id = msg.chat.id;
    var data = JSON.parse(callbackQuery.data);
    var spaceWikiName = data[0];
    var spaceName = data[1];

    var text = msg.reply_to_message.text;

    var command = text.substr(1, text.indexOf('@') - 1);
    if (command === "") {
      command = text;
    }

    console.log("Command: ", command);

    switch (command) {
      case utils.COMMANDS.NEW_INTEGRATION:
        {
          _this.insertIntegration(chat_id, msg.message_id, spaceWikiName, spaceName);
          break;
        }
      case utils.COMMANDS.DELETE_INTEGRATION:
        {
          _this.deleteIntegration(chat_id, msg.message_id, spaceWikiName, spaceName);
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

  this.fetchSpaces = function (chatId, msg, access_token) {
    var opts = {
      method: 'GET',
      uri: 'https://api.assembla.com/v1/spaces',
      auth: {
        bearer: access_token
      }
    };
    request(opts, function (error, response, responseBody) {
      responseBody = JSON.parse(responseBody);
      if (responseBody.error) {
        console.log(spaces);
        bot.sendMessage(chatId, utils.MESSAGE.INVALID_TOKEN);
      } else {
        var _spaces = [];
        for (var i = 0; i < responseBody.length; i++) {
          var _responseBody$i = responseBody[i],
              wiki_name = _responseBody$i.wiki_name,
              name = _responseBody$i.name;

          var callback_data = JSON.stringify([wiki_name, name]);
          console.log("Wiki Name: ", wiki_name);
          _spaces.push([{ text: name, callback_data: callback_data }]);
        }

        var _opts = {
          reply_to_message_id: msg.message_id,
          reply_markup: {
            inline_keyboard: _spaces
          }
        };
        bot.sendMessage(chatId, utils.MESSAGE.CHOOSE_SAPCE_INTEGRATE, _opts);
      }
    });
  };

  this.refreshToken = function (chatId, msg, refresh_token) {
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
        _this.fetchSpaces(chatId, msg, access_token);
      }
    });
  };

  this.handleNewIntegration = function (chatId, msg) {
    _models2.default.Chat.findOne({ where: { chatId: chatId } }).then(function (chat) {
      console.log(chat.dataValues);
      var _chat$dataValues = chat.dataValues,
          access_token = _chat$dataValues.access_token,
          refresh_token = _chat$dataValues.refresh_token,
          expires_at = _chat$dataValues.expires_at;

      if (new Date().getTime() > expires_at.getTime()) {
        _this.refreshToken(chatId, msg, refresh_token);
      } else {
        _this.fetchSpaces(chatId, msg, access_token);
      }
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
        var _spaces2 = [];
        for (var i = 0; i < integrations.length; i++) {
          var _integrations$i$dataV = integrations[i].dataValues,
              spaceWikiName = _integrations$i$dataV.spaceWikiName,
              spaceName = _integrations$i$dataV.spaceName;

          var callback_data = JSON.stringify([spaceWikiName, spaceName]);

          _spaces2.push([{ text: spaceName, callback_data: callback_data }]);
        }

        var opts = {
          reply_to_message_id: messageId,
          reply_markup: {
            inline_keyboard: _spaces2
          }
        };
        bot.sendMessage(chatId, utils.MESSAGE.CHOOSE_SAPCE_DELETE, opts);
      }
    });
  };
};