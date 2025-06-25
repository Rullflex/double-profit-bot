import { Bot, Context } from 'grammy';
import { sheets_v4 } from 'googleapis';
import { TelegramService, LoggerService } from '@/services';
import { getSheetsClient } from '@/services/google-sheets-service';

export interface ExecutionContext {
  signal: AbortSignal;
  cancel: () => void;
}

export interface AppContext {
  bot: Bot;
  logger: LoggerService;
  sheets: sheets_v4.Sheets;
  steps: Map<number, Function>;
  telegramService: TelegramService;
  ctx: ExecutionContext;
}

export async function createAppContext(botToken: string): Promise<AppContext> {
  const bot = new Bot(botToken);
  const logger = new LoggerService();
  const sheets = await getSheetsClient();
  const telegramService = new TelegramService(bot.api);
  const steps = new Map<number, (app: AppContext, ctx: Context) => Promise<void>>();
  const abortController = new AbortController();

  return {
    bot,
    logger,
    sheets,
    steps,
    telegramService,
    ctx: {
      signal: abortController.signal,
      cancel: () => abortController.abort(),
    },
  };
}