import { Bot, Context } from 'grammy';
import { sheets_v4 } from 'googleapis';
import { LoggerService } from '@/services';
import { getSheetsClient } from '@/services/google-sheets-service';

export interface ExecutionContext {
  signal: AbortSignal;
  cancel: () => void;
}

export interface AppContext {
  internalBot: Bot;
  externalBot: Bot;
  logger: LoggerService;
  sheets: sheets_v4.Sheets;
  steps: Map<number, (app: AppContext, ctx: Context) => Promise<void>>;
  ctx: ExecutionContext;
}

export async function createAppContext(): Promise<AppContext> {
  const internalBot = new Bot(process.env.INTERNAL_BOT_TOKEN);
  const externalBot = new Bot(process.env.EXTERNAL_BOT_TOKEN);
  const logger = new LoggerService();
  const sheets = await getSheetsClient();
  const steps: AppContext['steps'] = new Map();
  const abortController = new AbortController();

  return {
    internalBot,
    externalBot,
    logger,
    sheets,
    steps,
    ctx: {
      signal: abortController.signal,
      cancel: () => abortController.abort(),
    },
  };
}