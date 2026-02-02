import { autoRetry } from '@grammyjs/auto-retry'
import { Bot } from 'grammy'

export function createNotification() {
  const notificationBot = new Bot(process.env.EXTERNAL_BOT_TOKEN)

  /** @see https://grammy.dev/ru/plugins/auto-retry */
  notificationBot.api.config.use(autoRetry())

  function send(...args: Parameters<Bot['api']['sendMessage']>) {
    return notificationBot.api.sendMessage(...args)
  }

  return {
    send,
  }
}
