import {ASSEMBLA_CREDENTIALS} from "./utils"

const bodyParser = require('body-parser');
const feathers = require('feathers');
const featherClient = require('feathers/client')
const io = require('socket.io-client');
const mongoose = require('mongoose')
const request = require('request');
const socketio = require('feathers-socketio');
const socketioClient = require('feathers-socketio/client')
const oauth2 = require('simple-oauth2').create(ASSEMBLA_CREDENTIALS)

import * as routes from './routes'
import services from './services'
import models from './models'
import {TelegramBot, BotOperations} from './TelegramBot'

const mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/assemblaDb';

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
const bot = new TelegramBot()
const botOperations = new BotOperations()
bot.onText(/\/(.+)/, (msg, match) => {
  botOperations.handleCommands(msg, match[1])
});

bot.on('callback_query',  (callbackQuery) => {
  botOperations.handleCallbackQuery(callbackQuery)
});

let date = new Date()

setInterval(() => {
  models.Integration.findAll({ include: [models.Chat]})
    .then(res => {
      if (res !== null) {
        for (let i = 0; i < res.length; i++) {
          const integration = res[i].dataValues
          const chat = integration.chat.dataValues
          const {chatId, access_token, refresh_token, expires_in} = chat
          let token = oauth2.accessToken.create({access_token, refresh_token, expires_in})
          if (token.expired()) {
            token.refresh()
              .then((result) => {
                token = result;
                models.Chat.update({ ...token }, { where: { chatId } })
              });
          }
          botOperations.fetchActivity(chatId, integration.spaceId, date, token)

          date = new Date()
          console.log("Data "+i+": ", integration.spaceId)
        }
      }
    })
}, 60000)

// token.token.access_token
// /spaces/cTOCMCa_4r57Jddmr6CpXy

app.listen(process.env.PORT || 3030, () => {
  console.log(`Assembla Bot Server started at port: ${process.env.PORT || 3030}`);
});

//git push https://git.heroku.com/assembla-bot-server.git master
