const request = require('request');
const oauth2 = require('simple-oauth2').create(utils.ASSEMBLA_CREDENTIALS)
const telegram = require('node-telegram-bot-api');

import * as utils from './utils'
import Chat from './models/mongo'
import models from './models'

let bot = null

export class TelegramBot {
  constructor() {
    if (!bot) {
      bot = new telegram(utils.TELEGRAM_TOKEN, {polling: true});
    }
    return bot
  }
}

export class BotOperations {

  handleCallbackQuery = (callbackQuery) => {
    const data = JSON.parse(callbackQuery.data);
    const space = {_id: data[0], spaceName: data[1]}
    const msg = callbackQuery.message;
    const chat_id = msg.chat.id

    Chat.integrateSpaceInChat(chat_id, space, (err, res) => {
      if (!err) {
        const opts = {
          chat_id,
          message_id: msg.message_id,
        };

        bot.editMessageText(`"${space.spaceName}"` + utils.MESSAGE.SPACE_INTEGRATED, opts);
      }
    })
  }

  handleCommands = (msg, command) => {
    const chatId = msg.chat.id;
    const COMMANDS = utils.COMMANDS
    switch (command){
      case COMMANDS.START:
      case COMMANDS.HELP: {
        bot.sendMessage(chatId, `${utils.MESSAGE.INTRODUCE_BOT}`);
        break;
      }
      case COMMANDS.CONNECT: {
        this.handleConnect(chatId)
        break;
      }
      case COMMANDS.NEW_INTEGRATION: {
        this.handleNewIntegration(chatId, msg)
        break;
      }
      case COMMANDS.LIST_INTEGRATION: {
        this.handleListIntegrations(chatId)
        break;
      }
      case COMMANDS.DELETE_INTEGRATION: {
        this.handleDeleteIntegration()
        break;
      }
      default: {
        bot.sendMessage(chatId, utils.MESSAGE.COMMAND_NOT_FOUND);
      }
    }
  }

  handleConnect = (chatId) => {
    const AUTHORIZATION_URI = oauth2.authorizationCode.authorizeURL({
      client_id: utils.ASSEMBLA_CREDENTIALS.client.id,
      response_type: 'code',
      state: chatId
    });
    bot.sendMessage(chatId, utils.MESSAGE.CONNECT + AUTHORIZATION_URI);
  }

  fetchSpaces = (chatId, msg, token) => {
    const opts = {
      method: 'GET',
      uri: `https://api.assembla.com/v1/spaces`,
      auth: {
        bearer: token.access_token
      }
    }
    request(opts, (error, response, spaces) => {
      spaces = JSON.parse(spaces)
      if (spaces.error) {
        console.log(spaces)
        bot.sendMessage(chatId, utils.MESSAGE.INVALID_TOKEN);
      } else {
        const names = []
        for (let i = 0; i < spaces.length; i++) {
          const spaceId = spaces[i].id
          const spaceName = spaces[i].name
          const data = JSON.stringify([spaceId, spaceName]);

          names.push([{text: spaceName, callback_data: data}])
        }

        const opts = {
          reply_to_message_id: msg.message_id,
          reply_markup: {
            inline_keyboard: names
          }
        };
        bot.sendMessage(chatId, utils.MESSAGE.CHOOSE_SAPCE, opts);
      }
    });
  }

  handleNewIntegration = (chatId, msg) => {
    models.Chat.findOne({where: {chatId}})
      .then( chat => {
        console.log(chat.dataValues)
        this.fetchSpaces(chatId, msg, chat.dataValues)
      })
    }

  // Mongodb methods

  // handleListIntegrations = (chatId) => {
  //   Chat.getChatById(chatId, (err, chat) => {
  //     if (!err) {
  //       const {integrations} = chat
  //       let integrationStr = ''
  //       for (let i = 0; i < integrations.length; i++) {
  //         integrationStr += `${(i+1)}. ${integrations[i].spaceName}\n`
  //       }
  //       bot.sendMessage(chatId, integrationStr);
  //     }
  //   })
  // }
  //
  // handleNewIntegration = (chatId, msg) => {
  //   Chat.getChatById(chatId, (err, chat) => {
  //     if (!err) {
  //       this.fetchSpaces(chatId, msg, chat.token)
  //     }
  //   })
  // }
}