import type { sheets_v4 } from 'googleapis'
import type { Context } from 'grammy'
import type winston from 'winston'
import { Bot } from 'grammy'
import { createLogger } from '@/services'
import { getSheetsClient } from '@/services/google-sheets-service'
import { createNotification } from '@/services/notification-service'

export interface ExecutionContext {
  signal: AbortSignal
  cancel: () => void
}

export interface AppContextOptions {
  botToken: string
  loggerLabel?: string
}

export interface AppContext {
  bot: Bot
  notification: ReturnType<typeof createNotification>
  logger: winston.Logger
  sheets: sheets_v4.Sheets
  steps: Map<number, (app: AppContext, ctx: Context) => Promise<void>>
  ctx: ExecutionContext
}

export async function createAppContext({ botToken, loggerLabel }: AppContextOptions): Promise<AppContext> {
  const bot = new Bot(botToken)

  const notification = createNotification()
  const logger = createLogger({ label: loggerLabel })
  const sheets = await getSheetsClient()
  const steps: AppContext['steps'] = new Map()
  const abortController = new AbortController()

  return {
    bot,
    notification,
    logger,
    sheets,
    steps,
    ctx: {
      signal: abortController.signal,
      cancel: () => abortController.abort(),
    },
  }
}
