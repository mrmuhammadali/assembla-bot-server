'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('../utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// import Chat from '../models'

var telegram = require('node-telegram-bot-api');
var router = require('express').Router();
var oauth2 = require('simple-oauth2').create(utils.ASSEMBLA_CREDENTIALS);

// const bot = new telegram(utils.TELEGRAM_TOKEN, {polling: true});

exports.default = router.get('', function (req, res) {
  var _req$query = req.query,
      code = _req$query.code,
      state = _req$query.state;
  //we've got an auth code,
  //so now we can get a bearer token

  oauth2.authorizationCode.getToken({
    code: code,
    grant_type: 'authorization_code'
  }, function (error, result) {
    if (error) {
      console.log(utils.MESSAGE.ACCESS_TOKEN_ERROR, error);
      // bot.sendMessage(state, utils.MESSAGE.AUTHORIZATION_FAILED)
      res.redirect(utils.TELEGRAM_BOT_URL);
      return;
    }
    var token = oauth2.accessToken.create(result);
    var chatId = state;

    console.log("Token: ", token);
    console.log("ChatId: ", chatId);
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
  });
});