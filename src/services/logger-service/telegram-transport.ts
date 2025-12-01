import type { TransportStreamOptions } from 'winston-transport'
import { Bot } from 'grammy'
import TransportStream from 'winston-transport'

interface TelegramTransportOptions extends TransportStreamOptions {
  botToken: string
  chatId: number | string
}

export class TelegramTransport extends TransportStream {
  private bot: Bot
  private chatId: number | string

  constructor(opts: TelegramTransportOptions) {
    super(opts)
    this.bot = new Bot(opts.botToken)
    this.chatId = opts.chatId
  }

  override log(info: any, callback: () => void) {
    setImmediate(() => this.emit('logged', info))

    const message = `🚨 <b>[${info.level.toUpperCase()}]</b>\n<pre>${info.message}</pre>`
    this.bot.api.sendMessage(this.chatId, message, { parse_mode: 'HTML' }).catch((err) => {
      console.error('Failed to send log message to Telegram', err)
    })

    callback()
  }
}
