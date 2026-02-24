import { plural } from '../utils'

export const REPLY_MESSAGE = {
  INTERNAL_ERROR: 'Произошла внутренняя ошибка. Попробуйте еще раз или сообщите администратору.',
  UNKNOWN_COMMAND: 'Я вас не понял. Введите / чтобы увидеть список команд',
  RESET_COMMAND: 'Состояние сброшено. Напечатай / чтобы увидеть список команд.',

  // messages from elama-remain
  ELAMA_COMMAND: 'Начинаю выгрузку остатков из eLama',
  ELAMA_MANUAL_COMMAND: `Отправь файл с главной страницы eLama со списком всех клиентов
Не забудь внизу страницы поставить максимальное количество строк.
Chrome — «Сохранить как... → Веб-страница полностью»
Safari — «Сохранить как... → Веб-архив»`,
  ELAMA_INVALID_FILE: 'Ожидается HTML-файл. Пожалуйста, отправьте его.',
  ELAMA_SUCCESS_UPDATE: (count: number) => `Данные о свободных остатках по ${count} ${plural(count, ['филиалу', 'филиалам', 'филиалам'])} были обновлены`,

  ELAMA_INVOICE_START: 'Начинаю выставление счетов на рекламный бюджет eLama',
  ELAMA_INVOICE_END: 'Выставление счетов на рекламный бюджет eLama завершено',

  // messages from mass-message
  MASS_MESSAGE_SELECT_GROUP: 'Выбери группу чатов для рассылки:',
  MASS_MESSAGE_SEND_MESSAGE: 'Теперь напиши сообщение для рассылки.',
  MASS_MESSAGE_SEND_SUCCESS: (count: number) => `Сообщение отправлено в ${count} ${plural(count, ['чат', 'чата', 'чатов'])}`,

  // messages from daily-report
  DAILY_REPORT_IN_PROGRESS: 'Собираю нужные данные...',
  DAILY_REPORT_SUCCESS: 'Отчеты успешно отправлены ✅',
  DAILY_REPORT_FAIL: 'Не во все чаты удалось отправить отчеты 😞',

  ADD_TO_CHAT_SUCCESS: `
Всем привет!
Контакт установлен
👉👈`,
} as const
