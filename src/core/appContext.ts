import { Bot } from 'grammy';
import { sheets_v4 } from 'googleapis';
import { DataStorage, TelegramService, LoggerService } from '@/services';
import { getSheetsClient } from '@/services/google-sheets-service';

export interface AppContext {
  bot: Bot;
  logger: LoggerService;
  sheets: sheets_v4.Sheets;
  storage: DataStorage;
  telegramService: TelegramService;
}

export async function createAppContext(): Promise<AppContext> {
  const bot = new Bot(process.env.BOT_TOKEN!);
  const logger = new LoggerService();
  const sheets = await getSheetsClient();
  const telegramService = new TelegramService(bot.api);
  const storage = new DataStorage();

  return { bot, logger, sheets, telegramService, storage };
}