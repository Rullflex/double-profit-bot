import { type Context } from 'grammy';
import { getCommonMoneyRemain, updateCommonMoneyRemain } from '@/infrastructure/google-sheets';
import { type AppContext } from '@/core/appContext';
import { parseElamaRemains } from './parseElamaRemains';
import { getSuccessMessage } from './getSuccessMessage';

export async function processElamaFile({ logger, sheets, telegramService }: AppContext, ctx: Context) {
  const document = ctx.message?.document;
  if (!document) {
    return;
  }

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

  if (!ctx.chat) {
    logger.withPrefix('processElamaFile').error("Chat ID not found in context");
    return;
  }

  await telegramService.sendMessageWithRetry(
    ctx.chat.id,
    getSuccessMessage(updatedCount),
  );
}
