import type { BotCommand } from 'grammy/types'

export const enum InternalCommand {
  START = 'start',
  ELAMA = 'elama',
  ELAMA_INVOICE = 'elama_invoice',
  ELAMA_MANUAL = 'elama_file',
  DAILYREPORT = 'dailyreport',
  MASSMESSAGE = 'massmessage',
  RESET = 'reset',
}

export const internalCommandList: BotCommand[] = [
  { command: InternalCommand.ELAMA, description: 'Автоматизированное обновление остатков из elama' },
  { command: InternalCommand.ELAMA_INVOICE, description: 'Автоматизированное выставление и рассылка счетов на рекламный бюджет elama' },
  { command: InternalCommand.ELAMA_MANUAL, description: 'Ручная обновление остатков по файлу из elama (устаревшее)' },
  { command: InternalCommand.DAILYREPORT, description: 'Отчёт по дням' },
  { command: InternalCommand.MASSMESSAGE, description: 'Массовая рассылка' },
  { command: InternalCommand.RESET, description: 'Сбросить состояние' },
]
