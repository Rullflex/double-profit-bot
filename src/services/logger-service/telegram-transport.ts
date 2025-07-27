import TransportStream, { TransportStreamOptions } from "winston-transport";
import { Bot } from "grammy";

interface TelegramTransportOptions extends TransportStreamOptions {
  bot: Bot;
  chatId: number | string;
}

export class TelegramTransport extends TransportStream {
  private bot: Bot;
  private chatId: number | string;

  constructor(opts: TelegramTransportOptions) {
    super(opts);
    this.bot = opts.bot;
    this.chatId = opts.chatId;
  }

  override log(info: any, callback: () => void) {
    setImmediate(() => this.emit("logged", info));

    const message = `🚨 <b>[${info.level.toUpperCase()}]</b>\n<pre>${info.message}</pre>`;
    this.bot.api.sendMessage(this.chatId, message, { parse_mode: "HTML" }).catch(() => {
      // Без повторной ошибки — чтобы логгер не упал
    });

    callback();
  }
}