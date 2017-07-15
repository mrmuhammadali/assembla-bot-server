const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const telegram = require('node-telegram-bot-api');

import * as routes from './routes'
import * as utils from './utils'

const app = express();

const bot = new telegram(utils.TELEGRAM_TOKEN, {polling: true});

bot.setWebHook(`${utils.BASE_URL}/bot${utils.TELEGRAM_TOKEN}`)

app.use(bodyParser.json());

app.use('/callback', routes.authCallback);

app.post(`/bot${utils.TELEGRAM_TOKEN}`, (req, res) => {
  console.log("Hook Response(Telegram):", res)
  console.log("Hook Request(Telegram):", req)
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.onText(/\/(.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  switch (match[1]){

    case 'connect': {
      console.log("connect: ", chatId)
      utils.AUTHORIZATION_URI.state = { chatId }
      bot.sendMessage(chatId, `Open this link to authorize the bot:\n${utils.AUTHORIZATION_URI}`);
      return;
    }

    default:
      bot.sendMessage(chatId, 'Command not found!');
      return;
  }
});

//user hits this route, but doesn't have a auth code, so we redirect
app.get('/', (req, res) =>
  // res.redirect('/auth')
  res.send("working!")
);
//
// app.get('/auth', (req, res) =>
//   res.redirect(AUTHORIZATION_URI)
// );

//callback url route specifed when you made your app

function pullSpaces ( res, token ) {
  request({
    method: 'GET',
    uri: 'https://api.assembla.com/v1/spaces',
    auth: {
      bearer: token.token.access_token
    }
  }, (error, response, body) => {
    //this contains a json object of all the user's spaces
    console.log("Response Body(Assembla): ", body)
  });

}

app.listen(process.env.PORT || 3000, () => {
  console.log(`Assembla Bot Server started at port: ${process.env.PORT || 3000}`);
});

//git push https://git.heroku.com/assembla-bot-server.git master
