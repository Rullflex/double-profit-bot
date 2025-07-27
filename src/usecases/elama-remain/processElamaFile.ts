import { type Context } from 'grammy';
import { getMoneyRemainData, updateCommonMoneyRemain } from '@/infrastructure/google-sheets';
import { type AppContext } from '@/core/appContext';
import { parseElamaRemains } from './parseElamaRemains';
import { REPLY_MESSAGE } from '@/shared/consts';
import { getFileBuffer } from '@/shared/utils';

export async function processElamaFile({ sheets, steps }: AppContext, ctx: Context) {
  const document = ctx.message?.document;
  if (!document) {
    await ctx.reply(REPLY_MESSAGE.ELAMA_INVALID_FILE);
    return;
  }

  const fileId = document.file_id;
  const buffer = await getFileBuffer(ctx.api, fileId); // TODO - catch error
  const parsedElamaRemains = parseElamaRemains(buffer);

  const currentRemains = await getMoneyRemainData(sheets); // TODO - catch error

  let updatedCount = 0;

  for (const current of currentRemains) {
  const parsed = parsedElamaRemains[current.elamaId];
    if (parsed) {
      current.elamaRemain = parsed.remain;
      updatedCount++;
    }
  }

  await updateCommonMoneyRemain(sheets, currentRemains);  // TODO - catch error

  await ctx.reply(REPLY_MESSAGE.ELAMA_SUCCESS_UPDATE(updatedCount));
  steps.delete(ctx.from.id);
}
