const credentials = {
  client: {
    id: "aw66LMAayr54oidmr6CpXy",
    secret: "f4d61a0c1447576b216c758b5f3daa1d"
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
      console.log("connect: ", chatId)
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
  res.redirect('/auth')
);
//
app.get('/auth', (req, res) =>
  res.redirect(authorization_uri)
);

//callback url route specifed when you made your app
app.get('/callback', (req, res) => {

  //we've got an auth code,
  //so now we can get a bearer token
  oauth2.authorizationCode.getToken({
    code: req.query.code,
    grant_type: 'authorization_code'
  }, (error, result) => {
    if (error) {
      console.log('Access Token Error: ', error);
      res.redirect('https://t.me/AssemblaBot');
      return;
    }
    const token = oauth2.accessToken.create(result);
    console.log("Token: ", token)
    res.redirect('https://t.me/AssemblaBot');
    pullSpaces( res, token );
  });

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
    console.log("Response Body(Assembla): ", body)
  });

}

app.listen(process.env.PORT || 3000, () => {
  console.log(`Assembla Bot Server started at port: ${process.env.PORT}`);
});

//git push https://git.heroku.com/assembla-bot-server.git master
