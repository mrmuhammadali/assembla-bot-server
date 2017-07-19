export const ASSEMBLA_URL = 'https://api.assembla.com'
export const BASE_URL = 'https://assembla-bot-server.herokuapp.com';
export const TELEGRAM_TOKEN = '436072794:AAGgdTQgILeY6YjrJZsh72ZbYx2u4gTLAWU'
export const TELEGRAM_BOT_URL = 'https://t.me/AssemblaBot'

export const DB_CONFIG = {
  name: 'd4mvs46suu2upa',
  user: 'wepcrlefgqfwky',
  password: '04bb6a1889990a139030ac0bcff1c9c4ca1501b5a90c5451c8f4b2fb4ff9927c',
  options: {
    host: 'ec2-107-20-250-195.compute-1.amazonaws.com:5432',
    dialect: 'postgres'
  }
}
export const DB_CONFIG_LOCAL = {
  name: 'assembla',
  user: 'assembla',
  password: 'assembla',
  options: {
    host: 'localhost',
    dialect: 'mysql'
  }
}

export const ASSEMBLA_CREDENTIALS = {
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

export const COMMANDS = {
  START: 'start',
  CONNECT: 'connect',
  NEW_INTEGRATION: 'newintegration',
  LIST_INTEGRATION: 'listintegrations',
  DELETE_INTEGRATION: 'delintegration',
  HELP: 'help',
  CANCEL: 'cancel'
}

export const MESSAGE = {
  COMMAND_NOT_FOUND: 'Command not found!',
  CONNECT: `Open this link to authorize the bot:\n`,
  CHOOSE_SAPCE: `Please choose a Space you'd like to receive notifications from:`,
  ACCESS_TOKEN_ERROR: 'Access Token Error: ',
  AUTHORIZATION_SUCCESSFUL: `Your Assembla account was connected successfully!\nYou can now use the /newintegration command.`,
  AUTHORIZATION_FAILED: `Authorization failed!\n\nUse /connect to authorize bot via OAuth.`,
  NOTHING_INTEGRATED: 'No Assembla integrations have been set up with this conversation.',
  NOT_AUTHORIZED: `Bot don't have access to your Assembla Spaces.\n\nUse /connect to authorize bot via OAuth.`,
  INVALID_TOKEN: `Access token is invalid or expired.`,
  SPACE_ALREADY_EXIST: "Space already integrated in this chat.",
  SPACE_INTEGRATED: " space integrated successfully.",
  INTRODUCE_BOT: `I'm a Assembla bot. I'll send notifications of activities in a space.\n\nAvailable commands:
  /connect - Authorize bot via OAuth
  /newintegration - Add integration with a GitHub repository
  /listintegrations - List all current integrations
  /delintegration - Delete integration
  /help - List available commands
  /cancel - Cancel the current command`
}