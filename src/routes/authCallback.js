import * as utils from '../utils'
import models from '../models'
import {TelegramBot} from "../TelegramBot"

const router = require('express').Router()
const oauth2 = require('simple-oauth2').create(utils.ASSEMBLA_CREDENTIALS)

export default router.get('', (req, res) => {
  const { code, state } = req.query
  const bot = new TelegramBot()
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
    const {access_token, refresh_token} = token
    const chat = {chatId, access_token, refresh_token}
    models.Chat.create(chat)
      .then(res => {
        bot.sendMessage(chatId, utils.MESSAGE.AUTHORIZATION_SUCCESSFUL)
      })
      .catch(err => {
        models.Chat.update({ access_token, refresh_token }, { where: { chatId } })
          .then(result => {
            bot.sendMessage(chatId, utils.MESSAGE.AUTHORIZATION_SUCCESSFUL)
          })
          .catch(err => {
            bot.sendMessage(chatId, utils.MESSAGE.AUTHORIZATION_FAILED)
          })
      })
    // let newChat = new Chat({ _id: chatId, token })
    // newChat.save((err, res) => {
    //   if (err) {
    //     Chat.updateToken(chatId, token, (updateTokenError, updateTokenResponse) => {
    //       if (updateTokenError)
    //         bot.sendMessage(state, utils.MESSAGE.AUTHORIZATION_FAILED)
    //       else
    //         bot.sendMessage(state, utils.MESSAGE.AUTHORIZATION_SUCCESSFUL)
    //     })
    //   }
    //   else
    //     bot.sendMessage(state, utils.MESSAGE.AUTHORIZATION_SUCCESSFUL)
    // });
    // bot.sendMessage(state, utils.MESSAGE.AUTHORIZATION_SUCCESSFUL)
    res.redirect(utils.TELEGRAM_BOT_URL);


  })
})