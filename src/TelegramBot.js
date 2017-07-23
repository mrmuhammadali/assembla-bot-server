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

  insertIntegration = (chatId, message_id, spaceId, spaceName) => {

    const opts = {chat_id: chatId, message_id}

    models.Integration.findOne({where: {chatId, spaceId}})
      .then(res => {
        if (res === null) {
          models.Integration.create({spaceId, spaceName, chatId})
            .then(res => {
              bot.editMessageText(`"${spaceName}"` + utils.MESSAGE.SPACE_INTEGRATED, opts);
              return;
            })
            .catch(err => {
              bot.editMessageText(utils.MESSAGE.DATABASE_ERROR, opts);
            })
        } else {
          bot.editMessageText(utils.MESSAGE.SPACE_ALREADY_EXIST, opts);
        }
      })

  }

  deleteIntegration = (chatId, message_id, spaceId, spaceName) => {
    const opts = {chat_id: chatId, message_id}

    models.Integration.destroy({where: {chatId, spaceId}})
      .then(res => {
        if (res >= 1) {
          bot.editMessageText(`"${spaceName}"` + utils.MESSAGE.SPACE_DELETED, opts);
        } else {
          bot.editMessageText(utils.MESSAGE.DATABASE_ERROR, opts);
        }
      })
      .catch(err => {
        bot.editMessageText(utils.MESSAGE.DATABASE_ERROR, opts);
      })
  }

  handleCallbackQuery = (callbackQuery) => {
    const msg = callbackQuery.message;
    const action = msg.reply_to_message.text.substr(1);
    const chat_id = msg.chat.id;
    const data = JSON.parse(callbackQuery.data);
    const spaceId = data[0]
    const spaceName = data[1]

    switch (action) {
      case utils.COMMANDS.NEW_INTEGRATION: {
        this.insertIntegration(chat_id, msg.message_id, spaceId, spaceName);
        break;
      }
      case utils.COMMANDS.DELETE_INTEGRATION: {
        this.deleteIntegration(chat_id, msg.message_id, spaceId, spaceName)
        break;
      }
    }

    // const space = {_id: data[0], spaceName: data[1]}
    //
    // Chat.integrateSpaceInChat(chat_id, space, (err, res) => {
    //   if (!err) {
    //     const opts = {
    //       chat_id,
    //       message_id: msg.message_id,
    //     };
    //
    //     bot.editMessageText(`"${space.spaceName}"` + utils.MESSAGE.SPACE_INTEGRATED, opts);
    //   }
    // })
  }

  handleCommands = (msg, command) => {
    const chatId = msg.chat.id;
    const COMMANDS = utils.COMMANDS
    switch (command){
      case COMMANDS.START:
      case COMMANDS.HELP: {
        bot.sendMessage(chatId, utils.MESSAGE.INTRODUCE_BOT);
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
        this.handleListIntegrations(chatId, msg.message_id)
        break;
      }
      case COMMANDS.DELETE_INTEGRATION: {
        this.handleDeleteIntegration(chatId, msg.message_id)
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
        bot.sendMessage(chatId, utils.MESSAGE.CHOOSE_SAPCE_INTEGRATE, opts);
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

  handleListIntegrations = (chatId, messageId) => {
    models.Integration.findAll({where:{chatId}})
      .then(integrations => {
        if (integrations !== null) {
          let integrationStr = ''
          for (let i = 0; i < integrations.length; i++) {
            console.log(integrations[i].dataValues.spaceName)
            integrationStr += `${(i+1)}. ${integrations[i].dataValues.spaceName}\n`
          }
          bot.sendMessage(chatId, utils.MESSAGE.LIST_INTEGRATION + integrationStr, {reply_to_message_id: messageId});
        }
      })
  }

  handleDeleteIntegration = (chatId, messageId) => {
    models.Integration.findAll({where:{chatId}})
      .then(integrations => {
        if (integrations !== null) {
          const names = []
          for (let i = 0; i < integrations.length; i++) {
            const {spaceId, spaceName} = integrations[i].dataValues
            const data = JSON.stringify([spaceId, spaceName]);

            names.push([{text: spaceName, callback_data: data}])
          }

          const opts = {
            reply_to_message_id: messageId,
            reply_markup: {
              inline_keyboard: names
            }
          };
          bot.sendMessage(chatId, utils.MESSAGE.CHOOSE_SAPCE_DELETE, opts);
        }
      })
  }

  appendZero = (num) => {
    if (num < 10) {
      return `0${num}`
    }
    return num
  }

  refreshToken = (chatId, token) => {
    token = oauth2.accessToken.create(token)
    if (token.expired()) {
      token.refresh()
        .then((result) => {
          token = result;
        });
    }
  }

  fetchActivity = (chatId, spaceId, date, token) => {
    let dateStr = `${date.getFullYear()}-${this.appendZero((date.getMonth() + 1))}-`
    dateStr += `${this.appendZero(date.getUTCDate())} ${this.appendZero(date.getUTCHours())}:${this.appendZero(date.getUTCMinutes())}`
    console.log(dateStr)
    const opts = {
      method: 'GET',
      uri: `https://api.assembla.com/v1/activity.json?space_id=${spaceId}&from=${dateStr}`,
      auth: {
        bearer: token.access_token
      }
    }
    request(opts, (error, response, activity) => {
      try {
        activity = JSON.parse(activity)
        if (activity.error) {
          console.log(activity)
          bot.sendMessage(chatId, utils.MESSAGE.INVALID_TOKEN);
        } else {
          for (let i = 0; i < activity.length; i++) {
            const {date, author_name, space_name, operation, title, object} = activity[i]
            const str = `${object}: ${date}\n${author_name} ${operation} '${title}' in Space '${space_name}'`
            bot.sendMessage(chatId, str);
          }
        }
      }
      catch (e) {

      }
    });
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