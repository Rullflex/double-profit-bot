import { autoRetry } from '@grammyjs/auto-retry'
import { Bot } from 'grammy'

export function createNotification() {
  const notificationBot = new Bot(process.env.EXTERNAL_BOT_TOKEN)

  /** @see https://grammy.dev/ru/plugins/auto-retry */
  notificationBot.api.config.use(autoRetry())

  return {
    send: notificationBot.api.sendMessage,
  }
}
