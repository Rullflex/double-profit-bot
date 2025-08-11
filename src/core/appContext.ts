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

/** @see https://grammy.dev/ru/plugins/auto-retry */ 
const autoRetryTransformer = autoRetry({
  maxRetryAttempts: 6,
  maxDelaySeconds: 15,
});

export async function createAppContext({ botToken, loggerLabel }: AppContextOptions): Promise<AppContext> {
  const bot = new Bot(botToken);
  const notificationBotApi = (new Bot(process.env.EXTERNAL_BOT_TOKEN)).api;
  notificationBotApi.config.use(autoRetryTransformer);

  const logger = createLogger({ botApi: notificationBotApi, label: loggerLabel });
  const sheets = await getSheetsClient();
  const steps: AppContext['steps'] = new Map();
  const abortController = new AbortController();

  return {
    bot,
    notificationBotApi,
    logger,
    sheets,
    steps,
    ctx: {
      signal: abortController.signal,
      cancel: () => abortController.abort(),
    },
  };
}