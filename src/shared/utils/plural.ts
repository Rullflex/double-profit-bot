/**
 * Получение правильного окончания слова в зависимости от числа перед ним (пример: 1 день, 2 дня, 5 дней).
 *
 * @param {number} number - число перед словом с окончанием.
 * @param {string[]} strings - варианты окончаний слов (обычно я проверяю с числами 1, 2, 5).
 *
 * @return {string}
 */
export function plural(number: number, strings: string[]) {
  const num = Math.abs(number); // Работаем с положительным значением числа

  if (Number.isInteger(num)) {
    const cases = [2, 0, 1, 1, 1, 2];

    return strings[
      num % 100 > 4 && num % 100 < 20 ? 2 : cases[num % 10 < 5 ? num % 10 : 5]
    ];
  }

  // Для дробных чисел всегда возвращаем второй вариант
  return strings[1];
}
