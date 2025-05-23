export function getSuccessMessage(count: number): string {
  if (count % 100 === 11) {
    return `Данные о свободных остатках по ${count} филиалам были обновлены`;
  } else if (count % 10 === 1) {
    return `Данные о свободных остатках по ${count} филиалу были обновлены`;
  } else {
    return `Данные о свободных остатках по ${count} филиалам были обновлены`;
  }
}
