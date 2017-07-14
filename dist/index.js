'use strict';

var _auth = require('./auth');

var auth = _interopRequireWildcard(_auth);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var bodyParser = require('body-parser');
var express = require('express');
var request = require('request');
var telegram = require('node-telegram-bot-api');

var app = express();

app.use(bodyParser.json());

var bot = new telegram(utils.TELEGRAM_TOKEN, { polling: true });

// bot.setWebHook(`${utils.BASE_URL}/bot${utils.TELEGRAM_TOKEN}`)

bot.onText(/\/(.+)/, function (msg, match) {
  var chatId = msg.chat.id;
  switch (match[1]) {

    case 'connect':
      {
        console.log("connect: ", chatId);
        bot.sendMessage(chatId, 'Open this link to authorize the bot:\n' + utils.AUTHORIZATION_URI);
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
app.get('/callback', function (req, res) {
  auth.callback(req, res);
});

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
  console.log('Assembla Bot Server started at port: ' + process.env.PORT);
});

//git push https://git.heroku.com/assembla-bot-server.git master