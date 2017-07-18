const bodyParser = require('body-parser');
const feathers = require('feathers');
const featherClient = require('feathers/client')
const io = require('socket.io-client');
const mongoose = require('mongoose')
const request = require('request');
const socketio = require('feathers-socketio');
const socketioClient = require('feathers-socketio/client')
const telegram = require('node-telegram-bot-api');

import * as routes from './routes'
import * as utils from './utils'
import services from './services'
// import Chat from './models'
const mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/assemblaDb';

const oauth2 = require('simple-oauth2').create(utils.ASSEMBLA_CREDENTIALS)

const app = feathers()
  .use(bodyParser.json())
  .use('/callback', routes.authCallback)
  .configure(socketio())
  .configure(services)

// const socket = io('http://localhost:3000/');
// const client = featherClient();
//
// // Set up Socket.io client with the socket
// client.configure(socketioClient(socket));

// app.service('users').get('cTOCMCa_4r57Jddmr6CpXy')

// client.service('users').get(`cTOCMCa_4r57Jddmr6CpXy`)
// socket.emit('users::get', `cTOCMCa_4r57Jddmr6CpXy`, { fetch: 'all' }, (error, message) => {
//   console.log('Found message', message);
// });

// mongoose.connect(mongoUri)
//
// mongoose.connection.on('connected', () => {
//   console.log("Connected to database")
// })


// Chat.getChatById("12345", (err, res) => {
//
//     console.log(res)
//   Chat.integrateSpaceInChat("12345", {_id: "id", spaceName: "dusion"}, (erro, respo) => {
//     console.log("UpdateChatById:", respo)
//     console.log("UpdateChatById:", erro)
//   })
// })




 const bot = new telegram(utils.TELEGRAM_TOKEN, {polling: true});


bot.onText(/\/(.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const COMMANDS = utils.COMMANDS;

  switch (match[1]){

    case COMMANDS.START:
    case COMMANDS.HELP: {
      bot.sendMessage(chatId, `${utils.MESSAGE.INTRODUCE_BOT}`);
      break;
    }

    case COMMANDS.CONNECT: {

      const AUTHORIZATION_URI = oauth2.authorizationCode.authorizeURL({
        client_id: utils.ASSEMBLA_CREDENTIALS.client.id,
        response_type: 'code',
        state: chatId
      });

      bot.sendMessage(chatId, `${utils.MESSAGE.CONNECT}${AUTHORIZATION_URI}`);
      break;
    }

    case COMMANDS.NEW_INTEGRATION: {
      Chat.getChatById(chatId, (err, chat) => {
        if (!err) {
          const {token} = chat
          request({
            method: 'GET',
            uri: `https://api.assembla.com/v1/spaces`,
            auth: {
              bearer: token.access_token
            }
          }, (error, response, body) => {
            console.log("Spaces:", body)
            //TODO send spaces to bot
          });
        }
      })
    }

    case COMMANDS.LIST_INTEGRATION: {
      Chat.getChatById(chatId, (err, chat) => {
        if (!err) {
          const {integrations} = chat

          

        }
      })
    }

    default: {
      bot.sendMessage(chatId, utils.MESSAGE.COMMAND_NOT_FOUND);
    }
  }
});

// token.token.access_token
// /spaces/cTOCMCa_4r57Jddmr6CpXy
app.get('/spaces', (req, res) => {
  const { space_id } = req.query
  request({
    method: 'GET',
    uri: `https://api.assembla.com/v1/activity.json?space_id=${space_id}`,
    auth: {
      bearer: 'b68c758499f479102aa6a81f478237e3'
    }
  }, (error, response, body) => {
    //this contains a json object of all the user's spaces
    console.log("Response Body(Assembla): ", body)
    console.log(req.query)
    res.send(body)
  });

})

app.listen(process.env.PORT || 3030, () => {
  console.log(`Assembla Bot Server started at port: ${process.env.PORT || 3030}`);
});

//git push https://git.heroku.com/assembla-bot-server.git master
