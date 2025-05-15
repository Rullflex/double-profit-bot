import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { setupLogger } from './logger';
import { handleReset, handleElama } from './handlers';
import { getUserState, clearUserState } from './storage';

dotenv.config();
const logger = setupLogger();

const token = getBotTokenOrFail();

const bot = new Telegraf(token);

bot.start((ctx) => ctx.reply("🤖 Бот запущен и работает!"));

bot.command("reset", handleReset);

bot.on('text', async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const state = await getUserState(userId);
  if (!state) return;

  switch (state) {
    case 'elama':
      await handleElama(ctx);
      break;
    // case 'dailyreport':
    //   await handleDailyReport(ctx);
      break;
    // добавим другие варианты позже
  }

  await clearUserState(userId);
});

bot.launch().then(() => logger.info("Бот успешно запущен"));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

function getBotTokenOrFail(): string {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    logger.error("BOT_TOKEN not set in .env");
    process.exit(1);
  }
  return token;
}