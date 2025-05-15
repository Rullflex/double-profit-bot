import dotenv from 'dotenv';
dotenv.config();

export const config = {
  botToken: process.env.BOT_TOKEN,
  debug: process.env.DEBUG === 'true',
  logToFile: process.env.LOG_TO_FILE === 'true',
};