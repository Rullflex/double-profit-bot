import TransportStream, { TransportStreamOptions } from "winston-transport";
import { Api } from "grammy";

interface TelegramTransportOptions extends TransportStreamOptions {
  botApi: Api;
  chatId: number | string;
}

export class TelegramTransport extends TransportStream {
  private botApi: Api;
  private chatId: number | string;

  constructor(opts: TelegramTransportOptions) {
    super(opts);
    this.botApi = opts.botApi;
    this.chatId = opts.chatId;
  }

  override log(info: any, callback: () => void) {
    setImmediate(() => this.emit("logged", info));

    const message = `🚨 <b>[${info.level.toUpperCase()}]</b>\n<pre>${info.message}</pre>`;
    this.botApi.sendMessage(this.chatId, message, { parse_mode: "HTML" }).catch((err) => {
      console.error("Failed to send log message to Telegram", err);
    });

    callback();
  }
}