import type { Context } from 'grammy'
import type { AppContext } from '@/core/appContext'
import { getMoneyRemainData, updateCommonMoneyRemain } from '@/infrastructure/google-sheets'
import { REPLY_MESSAGE } from '@/shared/consts'
import { parseElamaRemainsFromBrowser } from './parseElamaRemainsFromBrowser'
import { updateRemains } from './updateRemains'

export async function elamaAutoEntrypoint({ logger, sheets }: AppContext, ctx: Context) {
  const sent = await ctx.reply(REPLY_MESSAGE.ELAMA_COMMAND)

  const logProgress = (message: string) => {
    ctx.api.editMessageText(sent.chat.id, sent.message_id, message)
    logger.info(message)
  }
  const parsedElamaRemains = await parseElamaRemainsFromBrowser(logProgress)

  const currentRemains = await getMoneyRemainData(sheets)

  const { updatedCount, updatedRemains } = updateRemains(currentRemains, parsedElamaRemains)

  await updateCommonMoneyRemain(sheets, updatedRemains)

  await ctx.reply(REPLY_MESSAGE.ELAMA_SUCCESS_UPDATE(updatedCount))
}
