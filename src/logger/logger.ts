import winston from 'winston';
import fs from 'fs';
import { AsyncLocalStorage } from 'async_hooks';

const asyncLocalStorage = new AsyncLocalStorage<winston.Logger>();

let globalLogger: winston.Logger;

export function initLogger(debug: boolean, logToFile: boolean = false): () => void {
  const transports: winston.transport[] = [];

  // Консоль
  transports.push(
    new winston.transports.Console({
      level: debug ? 'debug' : 'info',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );

  // Лог в файл (если включен)
  if (logToFile) {
    transports.push(
      new winston.transports.File({
        filename: 'log.txt',
        level: debug ? 'debug' : 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      })
    );
  }

  globalLogger = winston.createLogger({
    level: debug ? 'debug' : 'info',
    transports,
  });

  return () => {
    // нет необходимости вызывать `.close()` для winston по умолчанию
  };
}

function getLogger(): winston.Logger {
  return asyncLocalStorage.getStore() || globalLogger;
}

// Поддержка логов с "контекстом"
export function runWithLogger<T>(logger: winston.Logger, fn: () => T): T {
  return asyncLocalStorage.run(logger, fn);
}

// Методы логирования
export function infoKV(message: string, meta: Record<string, unknown> = {}) {
  getLogger().info(message, meta);
}
export function warnKV(message: string, meta: Record<string, unknown> = {}) {
  getLogger().warn(message, meta);
}
export function errorKV(message: string, meta: Record<string, unknown> = {}) {
  getLogger().error(message, meta);
}
export function debugKV(message: string, meta: Record<string, unknown> = {}) {
  getLogger().debug(message, meta);
}
export function fatalKV(message: string, meta: Record<string, unknown> = {}) {
  getLogger().error(`FATAL: ${message}`, meta);
  process.exit(1);
}