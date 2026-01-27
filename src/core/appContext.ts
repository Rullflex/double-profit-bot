import type { sheets_v4 } from 'googleapis'
import type { Context } from 'grammy'
import type winston from 'winston'
import { createLogger } from '@/services'
import { getSheetsClient } from '@/services/google-sheets-service'
import { createNotification } from '@/services/notification-service'

export interface AppContextOptions {
  loggerLabel?: string
}

export interface AppContext {
  notification: ReturnType<typeof createNotification>
  logger: winston.Logger
  sheets: sheets_v4.Sheets
  steps: Map<number, (app: AppContext, ctx: Context) => Promise<void>>
}

export async function createAppContext({ loggerLabel }: AppContextOptions = {}): Promise<AppContext> {
  const notification = createNotification()
  const logger = createLogger({ label: loggerLabel })
  const sheets = await getSheetsClient()
  const steps: AppContext['steps'] = new Map()

  return {
    notification,
    logger,
    sheets,
    steps,
  }
}
