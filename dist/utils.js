'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var ASSEMBLA_URL = exports.ASSEMBLA_URL = 'https://api.assembla.com';
var BASE_URL = exports.BASE_URL = 'https://assembla-bot-server.herokuapp.com';
var TELEGRAM_TOKEN = exports.TELEGRAM_TOKEN = '436072794:AAGgdTQgILeY6YjrJZsh72ZbYx2u4gTLAWU';
// export const TELEGRAM_TOKEN = '407191495:AAFvFL2_KtFmo7QlcPzV7bJR-14YYBxTbXo'
var TELEGRAM_BOT_URL = exports.TELEGRAM_BOT_URL = 'https://t.me/AssemblaBot/';

var DB_CONFIG = exports.DB_CONFIG = {
  name: 'dfkcg96lgv1ob0',
  user: 'tqrldekflsrwxc',
  password: '621a00e80cc61917d3b261dd9f9aa39c819793a0634038b2099053fe4ebb57d3',
  options: {
    host: 'ec2-46-137-97-169.eu-west-1.compute.amazonaws.com',
    port: '5432',
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: true
    }
  }
};
var DB_CONFIG_LOCAL = exports.DB_CONFIG_LOCAL = {
  name: 'localdb',
  user: 'azure',
  password: '6#vWHD_$',
  options: {
    host: '127.0.0.1',
    // port: '55335',
    port: '3306',
    dialect: 'mysql'
  }
};

var ASSEMBLA_CREDENTIALS = exports.ASSEMBLA_CREDENTIALS = {
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

var REFRESH_TOKEN_URI = exports.REFRESH_TOKEN_URI = 'https://' + ASSEMBLA_CREDENTIALS.client.id + ':' + ASSEMBLA_CREDENTIALS.client.secret + '@api.assembla.com/token?grant_type=refresh_token&refresh_token=';

var COMMANDS = exports.COMMANDS = {
  START: 'start',
  CONNECT: 'connect',
  NEW_INTEGRATION: 'newintegration',
  LIST_INTEGRATION: 'listintegrations',
  DELETE_INTEGRATION: 'delintegration',
  HELP: 'help',
  PING: 'ping',
  CANCEL: 'cancel'
};

var MESSAGE = exports.MESSAGE = {
  COMMAND_NOT_FOUND: 'Command not found!',
  CONNECT: 'Open this link to authorize the bot:\n',
  CHOOSE_SAPCE_INTEGRATE: 'Please choose a Space you\'d like to receive notifications from:\n',
  CHOOSE_SAPCE_DELETE: 'Please choose a Space you\'d like to delete from this chat:\n',
  ACCESS_TOKEN_ERROR: 'Access Token Error: ',
  AUTHORIZATION_SUCCESSFUL: 'Your Assembla account was connected successfully!\nYou can now use the /newintegration command.',
  AUTHORIZATION_FAILED: 'Authorization failed!\n\nUse /connect to authorize bot via OAuth.',
  NOTHING_INTEGRATED: 'No Assembla integrations have been set up with this conversation.',
  NOT_AUTHORIZED: 'Bot don\'t have access to your Assembla Spaces.\n\nUse /connect to authorize bot via OAuth.',
  INVALID_TOKEN: 'Access token is invalid or expired.',
  SPACE_ALREADY_EXIST: "Space already integrated in this chat.",
  SPACE_INTEGRATED: " space integrated successfully.",
  SPACE_DELETED: " space deleted from this chat.",
  LIST_INTEGRATION: 'Following spaces are integrated:\n',
  PING: 'Yes! I am alive.',
  DATABASE_ERROR: "Process failed! Try again later.",
  INTRODUCE_BOT: 'I\'m a Assembla bot. I\'ll send notifications of activities in a space.\n\nAvailable commands:\n  /connect - Authorize bot via OAuth\n  /newintegration - Add integration with a GitHub repository\n  /listintegrations - List all current integrations\n  /delintegration - Delete integration\n  /help - List available commands\n  /cancel - Cancel the current command'
};