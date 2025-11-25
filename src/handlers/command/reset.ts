import type { Context } from 'grammy'
import type { AppContext } from '@/core/appContext'
import { REPLY_MESSAGE } from '@/shared/consts'

export async function handleReset(app: AppContext, ctx: Context) {
  app.steps.delete(ctx.from.id)
  ctx.reply(REPLY_MESSAGE.RESET_COMMAND)
}
