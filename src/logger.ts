import winston from 'winston';
import { config } from './config';

export function setupLogger() {
  const transports = [];

  if (config.logToFile) {
    transports.push(new winston.transports.File({ filename: 'log.txt' }));
  } else {
    transports.push(new winston.transports.Console());
  }

  return winston.createLogger({
    level: config.debug ? 'debug' : 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level}: ${message}`;
      })
    ),
    transports,
  });
}