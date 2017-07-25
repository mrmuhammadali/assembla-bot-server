'use strict';

var _routes = require('./routes');

var routes = _interopRequireWildcard(_routes);

var _models = require('./models');

var _models2 = _interopRequireDefault(_models);

var _utils = require('./utils');

var _TelegramBot = require('./TelegramBot');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var bodyParser = require('body-parser');
var express = require('express');

var bot = new _TelegramBot.TelegramBot();
var botOperations = new _TelegramBot.BotOperations();
var app = express().use(bodyParser.json()).use('/callback', routes.authCallback);

app.get('/', function (req, res) {
  res.redirect(_utils.TELEGRAM_BOT_URL);
});

app.get('/get-all', function (req, res) {
  _models2.default.Integration.findAll({ include: [_models2.default.Chat] }).then(function (integrations) {
    if (integrations !== null) {
      var data = [];
      for (var i = 0; i < integrations.length; i++) {
        var integration = integrations[i].dataValues;
        data.push(integration);
      }
      res.json(data);
    }
  });
});

app.post('/assembla-webhook', function (req, res) {
  var data = req.body;
  console.log("Webhook Request: ", data);
  res.json({ success: true });
  bot.sendMessage(-219802955, JSON.stringify(data));
});
app.post('/webhook', function (req, res) {
  var _req$body = req.body,
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

  var spaceSlug = link.substr(link.indexOf('code/') + 5);
  spaceSlug = spaceSlug.substr(0, spaceSlug.indexOf('/'));
  console.log("Webhook Request: ", spaceSlug);
  res.json({ name: spaceSlug });
  //bot.sendMessage(-219802955, JSON.stringify(data))
});

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

app.listen(process.env.PORT || 3030, function () {
  console.log('Assembla Bot Server started at port: ' + (process.env.PORT || 3030));
});