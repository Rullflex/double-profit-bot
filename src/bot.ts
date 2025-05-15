import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { setupLogger } from './logger';
import { loadData, saveData } from './storage';
import './handlers/ping';

dotenv.config();
const logger = setupLogger();

const token = process.env.BOT_TOKEN;
if (!token) {
  logger.error("BOT_TOKEN not set in .env");
  process.exit(1);
}

const bot = new Telegraf(token);

bot.start((ctx) => ctx.reply("🤖 Бот запущен и работает!"));
bot.command("ping", (ctx) => ctx.reply("pong"));

bot.launch().then(() => logger.info("Бот успешно запущен"));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));