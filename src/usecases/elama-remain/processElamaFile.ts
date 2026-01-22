import type { Context } from 'grammy'
import type { AppContext } from '@/core/appContext'
import { getMoneyRemainData, updateCommonMoneyRemain } from '@/infrastructure/google-sheets'
import { REPLY_MESSAGE } from '@/shared/consts'
import { getFileBuffer } from '@/shared/utils'
import { parseElamaRemainsFromFile } from './parseElamaRemainsFromFile'
import { updateRemains } from './updateRemains'

export async function processElamaFile({ sheets, steps }: AppContext, ctx: Context) {
  const document = ctx.message?.document
  if (!document) {
    await ctx.reply(REPLY_MESSAGE.ELAMA_INVALID_FILE)
    return
  }

  const fileId = document.file_id
  const buffer = await getFileBuffer(ctx.api, fileId)
  const parsedElamaRemains = parseElamaRemainsFromFile(buffer)

  const currentRemains = await getMoneyRemainData(sheets)

  const { updatedCount, updatedRemains } = updateRemains(currentRemains, parsedElamaRemains)

  await updateCommonMoneyRemain(sheets, updatedRemains)

  await ctx.reply(REPLY_MESSAGE.ELAMA_SUCCESS_UPDATE(updatedCount))
  steps.delete(ctx.from.id)
}
