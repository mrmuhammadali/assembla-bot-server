'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var ASSEMBLA_URL = exports.ASSEMBLA_URL = 'https://api.assembla.com';
var BASE_URL = exports.BASE_URL = 'https://assembla-bot-server.herokuapp.com';
var TELEGRAM_TOKEN = exports.TELEGRAM_TOKEN = '436072794:AAGgdTQgILeY6YjrJZsh72ZbYx2u4gTLAWU';
var TELEGRAM_BOT_URL = exports.TELEGRAM_BOT_URL = 'https://t.me/AssemblaBot';

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

var COMMANDS = exports.COMMANDS = {
  START: 'start',
  CONNECT: 'connect',
  NEW_INTEGRATION: 'newintegration',
  LIST_INTEGRATION: 'listintegration',
  DELETE_INTEGRATION: 'delintegration',
  HELP: 'help',
  CANCEL: 'cancel'
};

var MESSAGE = exports.MESSAGE = {
  COMMAND_NOT_FOUND: 'Command not found!',
  CONNECT: 'Open this link to authorize the bot:\n',
  CHOOSE_SAPCE: 'Please choose a Space you\'d like to receive notifications from.',
  ACCESS_TOKEN_ERROR: 'Access Token Error: ',
  AUTHORIZATION_SUCCESSFUL: 'Your Assembla account was connected successfully!\nYou can now use the /newintegration command.',
  AUTHORIZATION_FAILED: 'Authorization failed!\n\nUse /connect to authorize bot via OAuth.',
  NOTHING_INTEGRATED: 'No Assembla integrations have been set up with this conversation.',
  NOT_AUTHORIZED: 'Bot don\'t have access to your Assembla Spaces.\n\nUse /connect to authorize bot via OAuth.',
  SPACE_ALREADY_EXIST: "Space already integrated in this chat.",
  INTRODUCE_BOT: 'I\'m a Assembla bot. I\'ll send notifications of activities in a space.\n\nAvailable commands:\n  /connect - Authorize bot via OAuth\n  /newintegration - Add integration with a GitHub repository\n  /listintegrations - List all current integrations\n  /delintegration - Delete integration\n  /help - List available commands\n  /cancel - Cancel the current command'
};