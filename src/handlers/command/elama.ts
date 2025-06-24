import { CommandContext, Context } from 'grammy';
import { AppContext } from '@/core/appContext';
import { processElamaFile } from '@/usecases/elama-remain';

const askUploadFile = `Отправь файл с главной страницы eLama со списком всех клиентов
Не забудь внизу страницы поставить максимальное количество строк.
Chrome — «Сохранить как... → Веб-страница полностью»
Safari — «Сохранить как... → Веб-архив»`;

export async function handleElama(app: AppContext, ctx: CommandContext<Context>) {
  await app.telegramService.sendMessageWithRetry(ctx.chat.id, askUploadFile);
  app.steps.set(ctx.from.id, processElamaFile);
}