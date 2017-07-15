export const ASSEMBLA_URL = 'https://api.assembla.com'
export const BASE_URL = 'https://assembla-bot-server.herokuapp.com';
export const TELEGRAM_TOKEN = '441601404:AAEBmrTkSSJFhOt-Cihadlo2h8g6sKVtIs4'

export const CREDENTIALS = {
  client: {
    id: "aw66LMAayr54oidmr6CpXy",
    secret: "f4d61a0c1447576b216c758b5f3daa1d"
  },
  auth: {
    tokenHost: ASSEMBLA_URL,
    authorizePath: '/authorization',
    tokenPath: '/token'
  }
}

const oauth2 = require('simple-oauth2').create(CREDENTIALS)

export const AUTHORIZATION_URI = oauth2.authorizationCode.authorizeURL({
  client_id: CREDENTIALS.client.id,
  response_type: 'code',
  state: ''
});