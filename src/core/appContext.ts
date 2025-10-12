import { Api, Bot, Context } from 'grammy';
import { sheets_v4 } from 'googleapis';
import { createLogger } from '@/services'
import { getSheetsClient } from '@/services/google-sheets-service';
import type winston from 'winston';
import { autoRetry } from "@grammyjs/auto-retry";

export interface ExecutionContext {
  signal: AbortSignal;
  cancel: () => void;
}

export interface AppContextOptions {
  botToken: string;
  loggerLabel?: string;
}

export interface AppContext {
  bot: Bot;
  notificationBotApi: Api;
  logger: winston.Logger;
  sheets: sheets_v4.Sheets;
  steps: Map<number, (app: AppContext, ctx: Context) => Promise<void>>;
  ctx: ExecutionContext;
}

export async function createAppContext({ botToken, loggerLabel }: AppContextOptions): Promise<AppContext> {
  const bot = new Bot(botToken);
  const notificationBot = new Bot(process.env.EXTERNAL_BOT_TOKEN);

  /** @see https://grammy.dev/ru/plugins/auto-retry */ 
  notificationBot.api.config.use(autoRetry({
    maxRetryAttempts: 6,
  }));

  const logger = createLogger({ botApi: notificationBot.api, label: loggerLabel });
  const sheets = await getSheetsClient();
  const steps: AppContext['steps'] = new Map();
  const abortController = new AbortController();

  return {
    bot,
    notificationBotApi: notificationBot.api,
    logger,
    sheets,
    steps,
    ctx: {
      signal: abortController.signal,
      cancel: () => abortController.abort(),
    },
  };
}