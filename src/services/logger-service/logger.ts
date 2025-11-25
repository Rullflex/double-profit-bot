import type { Api } from 'grammy'
import winston from 'winston'
import { TelegramTransport } from './telegram-transport'

export function createLogger(options: { botApi?: Api, label?: string }): winston.Logger {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.timestamp({ format: 'DD.MM.YYYY HH:mm:ss' }),
      winston.format.label({ label: options.label ?? 'app' }),
      winston.format.printf((info) => {
        const { timestamp, level, message, label } = info
        const fullMessage = info.stack ? `${message}\n${info.stack}` : message
        return `[${timestamp}] [${label}] [${level.toUpperCase()}] ${fullMessage}`
      }),
    ),
    transports: [
      new winston.transports.Console(),
      ...(options.botApi && process.env.LOG_CHAT_ID
        ? [new TelegramTransport({
            level: 'error',
            botApi: options.botApi,
            chatId: process.env.LOG_CHAT_ID,
          })]
        : []),
    ],
  })
}
