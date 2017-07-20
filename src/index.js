const bodyParser = require('body-parser');
const feathers = require('feathers');
const featherClient = require('feathers/client')
const io = require('socket.io-client');
const mongoose = require('mongoose')
const request = require('request');
const socketio = require('feathers-socketio');
const socketioClient = require('feathers-socketio/client')

import * as routes from './routes'

import services from './services'

import {TelegramBot, BotOperations} from './TelegramBot'
const mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/assemblaDb';


import models  from './models'


const app = feathers()
  .use(bodyParser.json())
  .use('/callback', routes.authCallback)
  .configure(socketio())
  .configure(services)



// sequelize.sync({force: true})
//   .then(() => {
//   Chat.create({
//     chatId: 23,
//
//   })
//
//     const dt = {
//       spaceId: '123',
//       spaceName: 'Space',
//       chatId: 23
//     }
//     // Integration.beforeCreate((dt) => {
//     //
//     //
//     //
//     // })
//     Integration.create(dt)
//       .then((res) => {
//         console.log("RES:", res)
//       })
//       .catch((err) => {
//         console.log("eroooor:", err)
//       })
//   })
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
bot.onText(/\/(.+)/, (msg, match) => {
  new BotOperations().handleCommands(msg, match[1])
});

bot.on('callback_query',  (callbackQuery) => {
  new BotOperations().handleCallbackQuery(callbackQuery)
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
