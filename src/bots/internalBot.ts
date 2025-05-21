// src/bots/internalBot.ts
import { Telegraf } from 'telegraf';
import http from 'http';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { getConfig } from '../config/config';
import { initLogger, infoKV, errorKV } from '../logger/logger';
import { getAuthenticatedService } from '../googleSheetsService/auth';
import { createDataStorage } from '../storage';
import { createCommonData } from '../utils/common';
import { createInternalBotUsecase } from '../usecases/internalBot';

dotenv.config();

async function main() {
  const ctx = {}; // Имитация контекста Go
  const config = getConfig();

  const stopLogger = initLogger(config.project.debug, config.project.logToFile);
  infoKV(`Starting service: ${config.project.name}`);

  try {
    const gSheetService = await getAuthenticatedService();
    const bot = new Telegraf(config.internalBot.token);
    const externalBot = new Telegraf(config.externalBot.token);

    const dataStorage = createDataStorage();
    const commonData = createCommonData(dataStorage, gSheetService, bot, externalBot);
    const internalBot = createInternalBotUsecase(commonData);

    internalBot.startListening(config.internalBot.endpoint);
    createServer().listen(config.internalBot.port, () =>
      console.log(`Server started on port ${config.internalBot.port}`)
    );

    process.once('SIGINT', () => {
      infoKV('SIGINT received, shutting down...');
      process.exit(0);
    });

    process.once('SIGTERM', () => {
      infoKV('SIGTERM received, shutting down...');
      process.exit(0);
    });
  } catch (err) {
    errorKV('Fatal error in bot', err as any);
    process.exit(1);
  }
}

main();