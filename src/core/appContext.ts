import { Bot, Context } from 'grammy';
import { sheets_v4 } from 'googleapis';
import { TelegramService, LoggerService } from '@/services';
import { getSheetsClient } from '@/services/google-sheets-service';

export interface AppContext {
  bot: Bot;
  logger: LoggerService;
  sheets: sheets_v4.Sheets;
  steps: Map<number, Function>;
  telegramService: TelegramService;
}

export async function createAppContext(botToken: string): Promise<AppContext> {
  const bot = new Bot(botToken);
  const logger = new LoggerService();
  const sheets = await getSheetsClient();
  const telegramService = new TelegramService(bot.api);
  const steps = new Map<number, (app: AppContext, ctx: Context) => Promise<void>>();

  return { bot, logger, sheets, steps, telegramService };
}