const credentials = {
  client: {
    id: "f4cc077a0bd2a498bc19",
    secret: "683d920b71d181f3da5170f68d9bcc9da04f7f02"
  },
  auth: {
    tokenHost: 'https://api.assembla.com',
    authorizePath: '/authorization',
    tokenPath: '/token'
  }
}
const telegramToken = '441601404:AAEBmrTkSSJFhOt-Cihadlo2h8g6sKVtIs4'

const bodyParser = require('body-parser');
const express = require('express');
const oauth2 = require('simple-oauth2').create(credentials)
const request = require('request');
const telegram = require('node-telegram-bot-api');

const app = express();

app.use(bodyParser.json());

const authorization_uri = oauth2.authorizationCode.authorizeURL({
  client_id: credentials.client.id,
  response_type: 'code'
});

const bot = new telegram(telegramToken, {polling: true});

bot.onText(/\/(.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  switch (match[1]){

    case 'connect': {
      bot.sendMessage(chatId, `Open this link to authorize the bot:\n${authorization_uri}`);
      return;
    }

    default:
      bot.sendMessage(chatId, 'Command not found!');
      return;
  }



});

//user hits this route, but doesn't have a auth code, so we redirect
app.get('/', (req, res) =>
  res.send('Hi')
);
//
// app.get('/auth', (req, res) =>
//   res.redirect(authorization_uri)
// );

//callback url route specifed when you made your app
app.get('/callback', (req, res) => {
  const code = req.query.code;

  //we've got an auth code,
  //so now we can get a bearer token
  oauth2.authorizationCode.getToken({
    code: code,
    grant_type: 'authorization_code'
  }, saveToken);

  function saveToken(error, result) {
    if (error) {
      console.log('Access Token Error', error);
      res.redirect('/');
      return;
    }
    const token = oauth2.accessToken.create(result);
    pullSpaces( res, token );
  }
});

function pullSpaces ( res, token ) {
  request({
    method: 'GET',
    uri: 'https://api.assembla.com/v1/spaces',
    auth: {
      bearer: token.token.access_token
    }
  }, (error, response, body) => {
    //this contains a json object of all the user's spaces
    console.log(response)
  });

}

app.listen(3000, () => {
  console.log("Server started at port: 3030");
});
