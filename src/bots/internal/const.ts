import { BotCommand } from "grammy/types";

export const enum InternalCommand {
  START = "start",
  ELAMA = "elama",
  DAILYREPORT = "dailyreport",
  MASSMESSAGE = "massmessage",
  RESET = "reset",
}

export const internalCommandList: BotCommand[] = [
  { command: InternalCommand.ELAMA, description: "Загрузить файл eLama" },
  { command: InternalCommand.DAILYREPORT, description: "Отчёт по дням" },
  { command: InternalCommand.MASSMESSAGE, description: "Массовая рассылка" },
  { command: InternalCommand.RESET, description: "Сбросить состояние" },
];