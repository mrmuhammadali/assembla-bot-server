'use strict';

var _routes = require('./routes');

var routes = _interopRequireWildcard(_routes);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var bodyParser = require('body-parser');
var express = require('express');
var request = require('request');
var telegram = require('node-telegram-bot-api');

var oauth2 = require('simple-oauth2').create(utils.ASSEMBLA_CREDENTIALS);

var app = express();
var bot = new telegram(utils.TELEGRAM_TOKEN, { polling: true });

app.use(bodyParser.json());

app.use('/callback', routes.authCallback);

bot.onText(/\/(.+)/, function (msg, match) {
  var chatId = msg.chat.id;
  var COMMANDS = utils.COMMANDS;

  switch (match[1]) {
    case COMMANDS.CONNECT:
      {

        var AUTHORIZATION_URI = oauth2.authorizationCode.authorizeURL({
          client_id: utils.ASSEMBLA_CREDENTIALS.client.id,
          response_type: 'code',
          state: chatId
        });

        bot.sendMessage(chatId, '' + utils.MESSAGE.CONNECT + AUTHORIZATION_URI);
        break;
      }

    case COMMANDS.START:
    case COMMANDS.HELP:
      {
        bot.sendMessage(chatId, '' + utils.MESSAGE.INTRODUCE_BOT);
        break;
      }

    default:
      {
        bot.sendMessage(chatId, utils.MESSAGE.COMMAND_NOT_FOUND);
      }
  }
});

// token.token.access_token
app.get('/spaces', function (req, res) {
  request({
    method: 'GET',
    uri: 'https://api.assembla.com/v1/spaces',
    auth: {
      bearer: ""
    }
  }, function (error, response, body) {
    //this contains a json object of all the user's spaces
    console.log("Response Body(Assembla): ", body);
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log('Assembla Bot Server started at port: ' + (process.env.PORT || 3000));
});

//git push https://git.heroku.com/assembla-bot-server.git master