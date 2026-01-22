import type { CommandContext, Context } from 'grammy'
import type { AppContext } from '@/core/appContext'
import { REPLY_MESSAGE } from '@/shared/consts'
import { getFileBuffer } from '@/shared/utils'
import { processElamaRemains } from '@/usecases/elama-remain'

export async function handleElamaAuto(app: AppContext, ctx: CommandContext<Context>) {
  const sent = await ctx.reply(REPLY_MESSAGE.ELAMA_COMMAND)

  const logProgress = (message: string) => {
    ctx.api.editMessageText(sent.chat.id, sent.message_id, message)
    app.logger.info(message)
  }

  const updatedCount = await processElamaRemains(app, 'browser', { logProgress })

  await ctx.reply(REPLY_MESSAGE.ELAMA_SUCCESS_UPDATE(updatedCount))
}

export async function handleElamaManual(app: AppContext, ctx: CommandContext<Context>) {
  await ctx.reply(REPLY_MESSAGE.ELAMA_MANUAL_COMMAND)
  app.steps.set(ctx.from.id, handleElamaFile)
  app.logger.info(`Пользователь ${ctx.from.id} начал загрузку файла elama`)
}

async function handleElamaFile(app: AppContext, ctx: Context) {
  const document = ctx.message?.document
  if (!document) {
    await ctx.reply(REPLY_MESSAGE.ELAMA_INVALID_FILE)
    return
  }

  const fileId = document.file_id
  const buffer = await getFileBuffer(ctx.api, fileId)

  const updatedCount = await processElamaRemains(app, 'file', { buffer })

  await ctx.reply(REPLY_MESSAGE.ELAMA_SUCCESS_UPDATE(updatedCount))
  app.steps.delete(ctx.from.id)
}
