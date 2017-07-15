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

var oauth2 = require('simple-oauth2').create(utils.CREDENTIALS);

var app = express();

var bot = new telegram(utils.TELEGRAM_TOKEN, { polling: true });

bot.setWebHook(utils.BASE_URL + '/bot' + utils.TELEGRAM_TOKEN);

app.use(bodyParser.json());

app.use('/callback', routes.authCallback);

app.post('/bot' + utils.TELEGRAM_TOKEN, function (req, res) {
  console.log("Hook Response(Telegram):", res);
  console.log("Hook Request(Telegram):", req);
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.onText(/\/(.+)/, function (msg, match) {
  var chatId = msg.chat.id;
  switch (match[1]) {

    case 'connect':
      {
        console.log("connect: ", chatId);

        var AUTHORIZATION_URI = oauth2.authorizationCode.authorizeURL({
          client_id: utils.CREDENTIALS.client.id,
          response_type: 'code',
          state: chatId
        });

        bot.sendMessage(chatId, 'Open this link to authorize the bot:\n' + AUTHORIZATION_URI);
        return;
      }

    default:
      bot.sendMessage(chatId, 'Command not found!');
      return;
  }
});

//user hits this route, but doesn't have a auth code, so we redirect
app.get('/', function (req, res) {
  return (
    // res.redirect('/auth')
    res.send("working!")
  );
});
//
// app.get('/auth', (req, res) =>
//   res.redirect(AUTHORIZATION_URI)
// );

//callback url route specifed when you made your app

function pullSpaces(res, token) {
  request({
    method: 'GET',
    uri: 'https://api.assembla.com/v1/spaces',
    auth: {
      bearer: token.token.access_token
    }
  }, function (error, response, body) {
    //this contains a json object of all the user's spaces
    console.log("Response Body(Assembla): ", body);
  });
}

app.listen(process.env.PORT || 3000, function () {
  console.log('Assembla Bot Server started at port: ' + (process.env.PORT || 3000));
});

//git push https://git.heroku.com/assembla-bot-server.git master