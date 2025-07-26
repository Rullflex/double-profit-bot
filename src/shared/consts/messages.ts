import { plural } from "../utils";

export const REPLY_MESSAGE = {
  UNKNOWN_COMMAND: 'Я вас не понял. Введите / чтобы увидеть список команд',
  RESET_COMMAND: 'Состояние сброшено. Напечатай / чтобы увидеть список команд.',

  // messages from elama-remain
  ELAMA_COMMAND: `Отправь файл с главной страницы eLama со списком всех клиентов
Не забудь внизу страницы поставить максимальное количество строк.
Chrome — «Сохранить как... → Веб-страница полностью»
Safari — «Сохранить как... → Веб-архив»`,
  ELAMA_INVALID_FILE: 'Ожидается HTML-файл. Пожалуйста, отправьте его.',
  ELAMA_SUCCESS_UPDATE: (count: number) => {
    const pluralString = plural(count, ["филиалу", "филиалам", "филиалам"]);
    return `Данные о свободных остатках по ${count} ${pluralString} были обновлены`;
  },
} as const;