const TelegramBot = require('node-telegram-bot-api');

let bot = null;

const initTelegramBot = () => {
  if (!bot && process.env.TELEGRAM_BOT_TOKEN) {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
    console.log('✅ Telegram Bot initialized');
  }
  return bot;
};

const getTelegramBot = () => {
  if (!bot) {
    return initTelegramBot();
  }
  return bot;
};

module.exports = {
  initTelegramBot,
  getTelegramBot
}; 
