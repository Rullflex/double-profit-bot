import type { Context } from 'grammy'
import type { AppContext } from '@/core/appContext'
import { REPLY_MESSAGE } from '@/shared/consts'
import { processDailyReport } from '@/usecases/daily-report'

export async function handleDailyReport(app: AppContext, ctx: Context) {
  const chatId = ctx.chat?.id
  const userId = ctx.from?.id
  if (!userId || !chatId)
    return

  const statusInterval = setInterval(() => {
    ctx.reply(REPLY_MESSAGE.DAILY_REPORT_IN_PROGRESS)
  }, 18000)

  try {
    const { totalTasks, successCount } = await processDailyReport(app)

    const finalMessage = successCount < totalTasks ? REPLY_MESSAGE.DAILY_REPORT_FAIL : REPLY_MESSAGE.DAILY_REPORT_SUCCESS
    await ctx.reply(finalMessage)
  } finally {
    clearInterval(statusInterval)
  }
}
