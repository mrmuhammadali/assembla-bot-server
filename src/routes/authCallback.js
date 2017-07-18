import * as utils from '../utils'
import Chat from '../models'

const telegram = require('node-telegram-bot-api');
const router = require('express').Router()
const oauth2 = require('simple-oauth2').create(utils.ASSEMBLA_CREDENTIALS)

const bot = new telegram(utils.TELEGRAM_TOKEN, {polling: true});

export default router.get('', (req, res) => {
  const { code, state } = req.query
  //we've got an auth code,
  //so now we can get a bearer token
  oauth2.authorizationCode.getToken({
    code,
    grant_type: 'authorization_code'
  }, (error, result) => {
    if (error) {
      console.log(utils.MESSAGE.ACCESS_TOKEN_ERROR, error);
      bot.sendMessage(state, utils.MESSAGE.AUTHORIZATION_FAILED)
      res.redirect(utils.TELEGRAM_BOT_URL);
      return;
    }
    const token = oauth2.accessToken.create(result);
    const chatId = state

    console.log("Token: ", token)
    console.log("ChatId: ", chatId)
    let newChat = new Chat({ _id: chatId, token })
    newChat.save((err, res) => {
      if (err) {
        Chat.updateToken(chatId, token, (updateTokenError, updateTokenResponse) => {
          if (updateTokenError)
            bot.sendMessage(state, utils.MESSAGE.AUTHORIZATION_FAILED)
          else
            bot.sendMessage(state, utils.MESSAGE.AUTHORIZATION_SUCCESSFUL)
        })
      }
      else
        bot.sendMessage(state, utils.MESSAGE.AUTHORIZATION_SUCCESSFUL)
    });

    res.redirect(utils.TELEGRAM_BOT_URL);


  })
})