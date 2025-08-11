import { type Context } from 'grammy';
import { getMoneyRemainData, updateCommonMoneyRemain } from '@/infrastructure/google-sheets';
import { type AppContext } from '@/core/appContext';
import { REPLY_MESSAGE } from '@/shared/consts';
import { parseElamaRemainsByBrowser } from './parseElamaRemainsByBrowser';

export async function elamaAutoEntrypoint({ sheets }: AppContext, ctx: Context) {
  await ctx.reply(REPLY_MESSAGE.ELAMA_COMMAND);
  const parsedElamaRemains = await parseElamaRemainsByBrowser();

  const currentRemains = await getMoneyRemainData(sheets);

  let updatedCount = 0;

  for (const current of currentRemains) {
  const parsed = parsedElamaRemains[current.elamaId];
    if (parsed) {
      current.elamaRemain = parsed.remain;
      updatedCount++;
    }
  }

  await updateCommonMoneyRemain(sheets, currentRemains);

  await ctx.reply(REPLY_MESSAGE.ELAMA_SUCCESS_UPDATE(updatedCount));
}
