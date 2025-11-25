import type { CommandContext, Context } from 'grammy'
import type { AppContext } from '@/core/appContext'
import { REPLY_MESSAGE } from '@/shared/consts'
import { processElamaFile } from '@/usecases/elama-remain'

// export async function handleElama(app: AppContext, ctx: CommandContext<Context>) {
//   await ctx.reply(REPLY_MESSAGE.ELAMA_COMMAND);
//   await elamaAutoEntrypoint(app, ctx);
//   await ctx.reply(REPLY_MESSAGE.ELAMA_MANUAL_COMMAND);
//   app.steps.set(ctx.from.id, processElamaFile);
// }

export async function handleElamaFile(app: AppContext, ctx: CommandContext<Context>) {
  await ctx.reply(REPLY_MESSAGE.ELAMA_MANUAL_COMMAND)
  app.steps.set(ctx.from.id, processElamaFile)
  app.logger.info(`Пользователь ${ctx.from.id} начал загрузку файла elama`)
}
