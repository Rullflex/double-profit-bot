import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';
dotenv.config();

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error('BOT_TOKEN is not defined in .env');
}

const bot = new Telegraf(token);

bot.start((ctx) => ctx.reply('Бот запущен!'));
bot.on('text', (ctx) => ctx.reply(`Ты написал: ${ctx.message.text}`));

bot.launch().then(() => {
  console.log('🤖 Бот успешно запущен');
});