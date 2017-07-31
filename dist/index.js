'use strict';

var _routes = require('./routes');

var routes = _interopRequireWildcard(_routes);

var _models = require('./models');

var _models2 = _interopRequireDefault(_models);

var _utils = require('./utils');

var _TelegramBot = require('./TelegramBot');

var _botOperations = require('./botOperations');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var bodyParser = require('body-parser');
var express = require('express');
var builder = require('botbuilder');

var telegramBot = new _TelegramBot.TelegramBot();
var botOperations = new _botOperations.BotOperations();
var app = express().use(bodyParser.json()).use('/callback', routes.authCallback);

app.get('/', function (req, res) {
  return res.redirect(_utils.TELEGRAM_BOT_URL);
});

app.get('/get-all', function (req, res) {
  _models2.default.Chat.findAll({ include: [_models2.default.Integration] }).then(function (chats) {
    if (chats !== null) {
      var data = [];
      for (var i = 0; i < chats.length; i++) {
        data.push(chats[i].dataValues);
      }
      res.json(data);
    }
  });
});

// Create chat bot
var connector = new builder.ChatConnector(_utils.SKYPE_CREDENTIALS);
var skypeBot = new builder.UniversalBot(connector);

app.post('/skype-messaging', connector.listen());

skypeBot.dialog('/', [function (session) {
  var _session$message = session.message,
      address = _session$message.address,
      text = _session$message.text;

  console.log("Session: ", address);
  botOperations.handleCommands(text, true, session);
}, function (session, results) {
  console.log("Dialog Results: ", results);
  session.send(results.response);
}]);

app.post('/assembla-webhook', function (req, res) {
  var _req$body = req.body,
      spaceWikiName = _req$body.spaceWikiName,
      author = _req$body.author,
      object = _req$body.object,
      space = _req$body.space,
      action = _req$body.action,
      title = _req$body.title,
      body = _req$body.body,
      link = _req$body.link,
      repositoryUrl = _req$body.repositoryUrl,
      repositorySuffix = _req$body.repositorySuffix,
      branch = _req$body.branch,
      commitId = _req$body.commitId;

  var str = object + ':\n' + author + ' ' + action + ' \'' + title + '\' in \'' + space + '\'';
  console.log(str);
  _models2.default.Integration.findAll({ where: { spaceWikiName: spaceWikiName } }).then(function (integrations) {
    if (integrations !== null) {
      for (var i = 0; i < integrations.length; i++) {
        var _integrations$i$dataV = integrations[i].dataValues,
            _spaceWikiName = _integrations$i$dataV.spaceWikiName,
            chatId = _integrations$i$dataV.chatId;

        console.log(chatId + ": ", _spaceWikiName);
        if (/[a-z]/.test(chatId)) {
          var address = _utils.SKYPE_ADDRESS;
          address.conversation.id = chatId;
          var reply = new builder.Message().address(address).text(str);
          skypeBot.send(reply);
        } else {
          telegramBot.sendMessage(chatId, str);
        }
      }
    }
  });
  res.json({ name: spaceWikiName });
});

telegramBot.onText(/\/(.+)/, function (msg, match) {
  botOperations.handleCommands(match[1], false, msg);
});

telegramBot.on('callback_query', function (callbackQuery) {
  botOperations.handleCallbackQuery(callbackQuery);
});

app.listen(process.env.PORT || 3030, function () {
  console.log('Assembla Bot Server started at port: ' + (process.env.PORT || 3030));
});