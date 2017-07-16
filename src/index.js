const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const telegram = require('node-telegram-bot-api');

import * as routes from './routes'
import * as utils from './utils'

const oauth2 = require('simple-oauth2').create(utils.ASSEMBLA_CREDENTIALS)

const app = express();
const bot = new telegram(utils.TELEGRAM_TOKEN, {polling: true});

app.use(bodyParser.json());

app.use('/callback', routes.authCallback);

bot.onText(/\/(.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const COMMANDS = utils.COMMANDS;

  switch (match[1]){
    case COMMANDS.CONNECT: {

      const AUTHORIZATION_URI = oauth2.authorizationCode.authorizeURL({
        client_id: utils.ASSEMBLA_CREDENTIALS.client.id,
        response_type: 'code',
        state: chatId
      });

      bot.sendMessage(chatId, `${utils.MESSAGE.CONNECT}${AUTHORIZATION_URI}`);
      break;
    }

    case COMMANDS.START:
    case COMMANDS.HELP: {
      bot.sendMessage(chatId, `${utils.MESSAGE.INTRODUCE_BOT}`);
      break;
    }

    default: {
      bot.sendMessage(chatId, utils.MESSAGE.COMMAND_NOT_FOUND);
    }
  }
});

// token.token.access_token
// /spaces/cTOCMCa_4r57Jddmr6CpXy
app.get('/spaces', (req, res) => {
  request({
    method: 'GET',
    uri: 'https://api.assembla.com/v1/activity?space_id=cTOCMCa_4r57Jddmr6CpXy',
    auth: {
      bearer: '6511f6e2e3bbc2ec24f5a753f87eadaf'
    }
  }, (error, response, body) => {
    //this contains a json object of all the user's spaces
    console.log("Response Body(Assembla): ", body)
    res.send(body)
  });

})

app.listen(process.env.PORT || 3000, () => {
  console.log(`Assembla Bot Server started at port: ${process.env.PORT || 3000}`);
});

//git push https://git.heroku.com/assembla-bot-server.git master
