import type { AppContext } from '@/core'
import { Bot } from 'grammy'
import { handleElamaAuto, handleElamaManual, handleReset, handleStart } from '@/handlers/command'
import { handleStepIfExists } from '@/handlers/message'
import { REPLY_MESSAGE } from '@/shared/consts'
import { dailyReportEntrypoint } from '@/usecases/daily-report'
import { massMessageEntrypoint } from '@/usecases/mass-message'
import { InternalCommand, internalCommandList } from './const'

export async function registerInternalBot(app: AppContext) {
  const bot = new Bot(process.env.INTERNAL_BOT_TOKEN)

  bot.api.setMyCommands(internalCommandList)

  bot.command(InternalCommand.START, handleStart)
  bot.command(InternalCommand.ELAMA, handleElamaAuto.bind(null, app))
  bot.command(InternalCommand.ELAMA_MANUAL, handleElamaManual.bind(null, app))
  bot.command(InternalCommand.DAILYREPORT, dailyReportEntrypoint.bind(null, app))
  bot.command(InternalCommand.MASSMESSAGE, massMessageEntrypoint.bind(null, app))
  bot.command(InternalCommand.RESET, handleReset.bind(null, app))

  bot.on(['message', 'callback_query:data'], async (ctx) => {
    const handled = await handleStepIfExists(ctx, app)

    if (!handled) {
      await ctx.reply(REPLY_MESSAGE.UNKNOWN_COMMAND)
    }
  })

  bot.catch((e) => {
    e.ctx.reply(REPLY_MESSAGE.INTERNAL_ERROR)
    app.logger.error(e.error)
  })

  await bot.start({
    drop_pending_updates: true,
  })
}
