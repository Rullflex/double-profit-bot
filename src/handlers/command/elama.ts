import { CommandContext, Context } from 'grammy';
import { AppContext } from '@/core/appContext';
import { processElamaFile } from '@/usecases/elama-remain';
import { REPLY_MESSAGE } from '@/shared/consts';

export async function handleElama(app: AppContext, ctx: CommandContext<Context>) {
  await ctx.reply(REPLY_MESSAGE.ELAMA_COMMAND);
  app.steps.set(ctx.from.id, processElamaFile);
}