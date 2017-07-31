'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BotOperations = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

var _models = require('./models');

var _models2 = _interopRequireDefault(_models);

var _TelegramBot = require('./TelegramBot');

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var request = require('request');
var oauth2 = require('simple-oauth2').create(utils.ASSEMBLA_CREDENTIALS);
var telegramBot = new _TelegramBot.TelegramBot();

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
//         telegramBot.sendMessage(chatId, utils.MESSAGE.INVALID_TOKEN);
//       } else {
//         for (let i = 0; i < activity.length; i++) {
//           const {date, author_name, space_name, operation, title, object} = activity[i]
//           const str = `${object}: ${dateFormat(date, `mmm d, yy '@' HH:MM`)}\n${author_name} ${operation} '${title}' in '${space_name}'`
//           console.log("Request Response: ", str)
//           telegramBot.sendMessage(chatId, str);
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
//       telegramBot.sendMessage(chatId, integrationStr);
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

  this.handleCommands = function (command, isSkype, session) {
    command = (0, _lodash.without)((0, _lodash.words)(command), 'Assembla', 'Bot')[0].toLowerCase();
    var COMMANDS = utils.COMMANDS;
    var chatId = isSkype ? (0, _lodash.get)(session, 'message.address.conversation.id', '') + '' : (0, _lodash.get)(session, 'chat.id', '') + '';

    switch (command) {
      case COMMANDS.START:
      case COMMANDS.HELP:
        {
          if (isSkype) {
            session.send(utils.MESSAGE.INTRODUCE_BOT);
          } else {
            telegramBot.sendMessage(chatId, utils.MESSAGE.INTRODUCE_BOT);
          }
          break;
        }
      case COMMANDS.CONNECT:
        {
          var AUTHORIZATION_URI = oauth2.authorizationCode.authorizeURL({
            client_id: utils.ASSEMBLA_CREDENTIALS.client.id,
            response_type: 'code',
            state: chatId
          });

          if (isSkype) {
            session.send(utils.MESSAGE.CONNECT + AUTHORIZATION_URI);
          } else {
            telegramBot.sendMessage(chatId, utils.MESSAGE.CONNECT + AUTHORIZATION_URI);
          }
          break;
        }
      case COMMANDS.NEW_INTEGRATION:
        {
          _this.handleNewIntegration(isSkype, chatId, session);
          break;
        }
      case COMMANDS.LIST_INTEGRATION:
        {
          _this.handleListIntegrations(isSkype, chatId, session);
          break;
        }
      case COMMANDS.DELETE_INTEGRATION:
        {
          _this.handleDeleteIntegration(isSkype, chatId, session);
          break;
        }
      default:
        {
          if (isSkype) {
            session.send(utils.MESSAGE.COMMAND_NOT_FOUND);
          } else {
            telegramBot.sendMessage(chatId, utils.MESSAGE.COMMAND_NOT_FOUND);
          }
        }
    }
  };

  this.insertIntegration = function (isSkype, chatId, session, spaceWikiName, spaceName) {

    var opts = void 0;
    if (!isSkype) {
      opts = { chat_id: chatId, message_id: session.message_id };
    }

    _models2.default.Integration.findOne({ where: { chatId: chatId, spaceWikiName: spaceWikiName } }).then(function (res) {
      if (res === null) {
        _models2.default.Integration.create({ spaceWikiName: spaceWikiName, spaceName: spaceName, chatId: chatId }).then(function (res) {
          if (isSkype) {
            session.send('"' + spaceName + '"' + utils.MESSAGE.SPACE_INTEGRATED);
          } else {
            telegramBot.editMessageText('"' + spaceName + '"' + utils.MESSAGE.SPACE_INTEGRATED, opts);
          }
        }).catch(function (err) {
          if (isSkype) {
            session.send(utils.MESSAGE.DATABASE_ERROR);
          } else {
            telegramBot.editMessageText(utils.MESSAGE.DATABASE_ERROR, opts);
          }
        });
      } else {
        if (isSkype) {
          session.send(utils.MESSAGE.SPACE_ALREADY_EXIST);
        } else {
          telegramBot.editMessageText(utils.MESSAGE.SPACE_ALREADY_EXIST, opts);
        }
      }
    });
  };

  this.deleteIntegration = function (chatId, message_id, integrationId, spaceName) {
    var opts = { chat_id: chatId, message_id: message_id };

    _models2.default.Integration.destroy({ where: { id: integrationId } }).then(function (res) {
      if (res >= 1) {
        telegramBot.editMessageText('"' + spaceName + '"' + utils.MESSAGE.SPACE_DELETED, opts);
      } else {
        telegramBot.editMessageText(utils.MESSAGE.DATABASE_ERROR, opts);
      }
    }).catch(function (err) {
      telegramBot.editMessageText(utils.MESSAGE.DATABASE_ERROR, opts);
    });
  };

  this.handleCallbackQuery = function (callbackQuery) {
    var session = callbackQuery.message;
    var chat_id = session.chat.id + '';
    var data = JSON.parse(callbackQuery.data);
    var spaceWikiName = data[0];
    var spaceName = data[1];

    var text = session.reply_to_message.text;

    var command = (0, _lodash.without)((0, _lodash.words)(text), 'Assembla', 'Bot')[0];

    console.log("Command: ", command);

    switch (command) {
      case utils.COMMANDS.NEW_INTEGRATION:
        {
          _this.insertIntegration(false, chat_id, session, spaceWikiName, spaceName);
          break;
        }
      case utils.COMMANDS.DELETE_INTEGRATION:
        {
          _this.deleteIntegration(chat_id, session.message_id, spaceWikiName, spaceName);
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
    //     telegramBot.editMessageText(`"${space.spaceName}"` + utils.MESSAGE.SPACE_INTEGRATED, opts);
    //   }
    // })
  };

  this.fetchSpaces = function (isSkype, chatId, session, access_token) {
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
        if (isSkype) {
          session.send(utils.MESSAGE.INVALID_TOKEN);
        } else {
          telegramBot.sendMessage(chatId, utils.MESSAGE.INVALID_TOKEN);
        }
      } else {
        var telegramSpaces = [];
        var skypeSpaces = {};
        for (var i = 0; i < responseBody.length; i++) {
          var _responseBody$i = responseBody[i],
              wiki_name = _responseBody$i.wiki_name,
              name = _responseBody$i.name;

          var callback_data = JSON.stringify([wiki_name, name]);
          console.log("Wiki Name: ", wiki_name);
          telegramSpaces.push([{ text: name, callback_data: callback_data }]);
          // skypeSpaces.push({title: name, value: wiki_name})
          skypeSpaces[name] = { spaceWikiName: wiki_name, name: name };
        }

        if (isSkype) {
          //TODO newintegration in skype

          // const attachmentObj = {
          //   contentType: "application/vnd.microsoft.card.adaptive",
          //   content: {
          //     type: "AdaptiveCard",
          //     body: [
          //       {
          //         "type": "TextBlock",
          //         "text": "Assembla Spaces",
          //         "size": "large",
          //         "weight": "bolder"
          //       },
          //       {
          //         "type": "TextBlock",
          //         "text": utils.MESSAGE.CHOOSE_SAPCE_INTEGRATE
          //       },
          //       {
          //         "type": "Input.ChoiceSet",
          //         "id": "snooze",
          //         "style":"compact",
          //         "choices": skypeChoices
          //       }
          //     ],
          //     "actions": [
          //       {
          //         "type": "Action.Http",
          //         "method": "POST",
          //         "url": "http://foo.com",
          //         "title": "Integrate"
          //       },
          //       {
          //         "type": "Action.Http",
          //         "method": "POST",
          //         "url": "http://foo.com",
          //         "title": "Dismiss"
          //       }
          //     ]
          //   }
          // }
          // session.send({
          //   type: "message",
          //   attachments: [
          //     attachmentObj
          //   ]
          // });

          // builder.Prompts.choice(session, "Which region would you like sales for?", ["Green", "Red"], {listStyle: builder.ListStyle["button"]});
          // session.send(msg);

          session.beginDialog('askSpace', { spaces: skypeSpaces });
        } else {
          var _opts = {
            reply_to_message_id: session.message_id,
            reply_markup: {
              inline_keyboard: telegramSpaces
            }
          };
          telegramBot.sendMessage(chatId, utils.MESSAGE.CHOOSE_SAPCE_INTEGRATE, _opts);
        }
      }
    });
  };

  this.refreshToken = function (isSkype, chatId, session, refresh_token) {
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
        _this.fetchSpaces(isSkype, chatId, session, access_token);
      }
    });
  };

  this.handleNewIntegration = function (isSkype, chatId, session) {
    _models2.default.Chat.findOne({ where: { chatId: chatId } }).then(function (chat) {
      var _get = (0, _lodash.get)(chat, 'dataValues', ''),
          access_token = _get.access_token,
          refresh_token = _get.refresh_token,
          expires_at = _get.expires_at;

      if (new Date().getTime() > expires_at.getTime()) {
        _this.refreshToken(isSkype, chatId, session, refresh_token);
      } else {
        _this.fetchSpaces(isSkype, chatId, session, access_token);
      }
    });
  };

  this.handleListIntegrations = function (isSkype, chatId, session) {
    _models2.default.Integration.findAll({ where: { chatId: chatId } }).then(function (integrations) {
      if (integrations !== null) {
        var integrationStr = '';
        for (var i = 0; i < integrations.length; i++) {
          console.log(integrations[i].dataValues.spaceName);
          integrationStr += i + 1 + '. ' + integrations[i].dataValues.spaceName + '\n';
        }
        var message = integrationStr ? utils.MESSAGE.LIST_INTEGRATION + integrationStr : utils.MESSAGE.NOTHING_INTEGRATED;

        if (isSkype) {
          session.send(message);
        } else {
          var reply_to_message_id = (0, _lodash.get)(session, 'message_id', 0);
          telegramBot.sendMessage(chatId, message, { reply_to_message_id: reply_to_message_id });
        }
      }
    });
  };

  this.handleDeleteIntegration = function (isSkype, chatId, session) {
    _models2.default.Integration.findAll({ where: { chatId: chatId } }).then(function (integrations) {
      if (integrations !== null) {
        var _spaces = [];
        for (var i = 0; i < integrations.length; i++) {
          var _integrations$i$dataV = integrations[i].dataValues,
              id = _integrations$i$dataV.id,
              spaceName = _integrations$i$dataV.spaceName;

          var callback_data = JSON.stringify([id, spaceName]);

          _spaces.push([{ text: spaceName, callback_data: callback_data }]);
        }

        if (isSkype) {
          //TODO integration in skype
          session.send("See Bot Documentation :p");
        } else {
          var reply_to_message_id = (0, _lodash.get)(session, 'message_id', 0);
          var opts = {
            reply_to_message_id: reply_to_message_id,
            reply_markup: {
              inline_keyboard: _spaces
            }
          };
          telegramBot.sendMessage(chatId, utils.MESSAGE.CHOOSE_SAPCE_DELETE, opts);
        }
      }
    });
  };
};