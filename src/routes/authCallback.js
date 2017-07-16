import * as utils from '../utils'

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
      res.redirect(utils.TELEGRAM_BOT_URL);
      return;
    }
    const token = oauth2.accessToken.create(result);

    console.log("Token: ", token)
    console.log("ChatId: ", state)

    res.redirect(utils.TELEGRAM_BOT_URL);

    // pullSpace(res, token)
  })
})