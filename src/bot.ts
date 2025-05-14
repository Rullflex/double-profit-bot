import { Telegraf } from 'telegraf';

const bot = new Telegraf('ТВОЙ_ТОКЕН_БОТА');

bot.start((ctx) => ctx.reply('Бот запущен!'));
bot.help((ctx) => ctx.reply('Чем могу помочь?'));
bot.on('text', (ctx) => ctx.reply('Ты написал: ' + ctx.message.text));

bot.launch().then(() => {
  console.log('🤖 Бот успешно запущен');
});