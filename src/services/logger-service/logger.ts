import winston from "winston";
import { TelegramTransport } from "./telegram-transport";
import { Api } from "grammy";

export const createLogger = (options: { botApi: Api; label?: string }): winston.Logger => winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp({ format: "DD.MM.YYYY HH:mm:ss" }),
    winston.format.label({ label: options.label ?? "app" }),
    winston.format.printf((info) => {
      const { timestamp, level, message, label } = info;
      const fullMessage = info.stack ? `${message}\n${info.stack}` : message;
      return `[${timestamp}] [${label}] [${level.toUpperCase()}] ${fullMessage}`;
    })
  ),
  transports: [
    ...(process.env.NODE_ENV !== "production" ? [new winston.transports.Console()] : []),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
    new TelegramTransport({
      level: "error",
      botApi: options.botApi,
      chatId: process.env.LOG_CHAT_ID,
    }),
  ],
});

