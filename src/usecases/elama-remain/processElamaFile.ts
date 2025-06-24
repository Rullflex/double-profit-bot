import { type Context } from 'grammy';
import { getCommonMoneyRemain, updateCommonMoneyRemain } from '@/infrastructure/google-sheets';
import { type AppContext } from '@/core/appContext';
import { parseElamaRemains } from './parseElamaRemains';
import { getSuccessMessage } from './getSuccessMessage';

export async function processElamaFile({ sheets, telegramService, steps }: AppContext, ctx: Context) {
  const document = ctx.message?.document;
  if (!document) {
    await ctx.reply("Ожидается HTML-файл. Пожалуйста, отправьте его.");
    return;
  }

  steps.delete(ctx.from.id);

  const fileId = document.file_id;
  const buffer = await telegramService.getFile(fileId);
  const parsedElamaRemains = parseElamaRemains(buffer);

  const currentRemains = await getCommonMoneyRemain(sheets);

  let updatedCount = 0;

  for (const current of currentRemains) {
  const parsed = parsedElamaRemains[current.elamaId];
    if (parsed) {
      current.elamaRemain = parsed.remain;
      updatedCount++;
    }
  }

  await updateCommonMoneyRemain(sheets, currentRemains);

  await telegramService.sendMessageWithRetry(
    ctx.chat.id,
    getSuccessMessage(updatedCount),
  );
}
