'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var ASSEMBLA_URL = exports.ASSEMBLA_URL = 'https://api.assembla.com';
var BASE_URL = exports.BASE_URL = 'https://assembla-bot-server.herokuapp.com';
var TELEGRAM_TOKEN = exports.TELEGRAM_TOKEN = '441601404:AAEBmrTkSSJFhOt-Cihadlo2h8g6sKVtIs4';

var CREDENTIALS = exports.CREDENTIALS = {
  client: {
    id: "aw66LMAayr54oidmr6CpXy",
    secret: "f4d61a0c1447576b216c758b5f3daa1d"
  },
  auth: {
    tokenHost: ASSEMBLA_URL,
    authorizePath: '/authorization',
    tokenPath: '/token'
  }
};

var oauth2 = require('simple-oauth2').create(CREDENTIALS);

var AUTHORIZATION_URI = exports.AUTHORIZATION_URI = oauth2.authorizationCode.authorizeURL({
  client_id: CREDENTIALS.client.id,
  response_type: 'code'
});