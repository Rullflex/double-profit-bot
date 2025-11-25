import type { Context } from 'grammy'
import type { AppContext } from '@/core/appContext'
import { InlineKeyboard } from 'grammy'
import { getChatGroupList } from '@/infrastructure/google-sheets'
import { REPLY_MESSAGE } from '@/shared/consts'
import { askMessageToSend } from './askMessageToSend'

export async function massMessageEntrypoint(app: AppContext, ctx: Context) {
  const groupTitles = await getChatGroupList(app.sheets)
  const keyboard = new InlineKeyboard()

  keyboard.text('Все чаты', 'all').row()

  groupTitles.forEach((title, i) => {
    const letter = String.fromCharCode(i + 1 + 63 + 4) // delta 4
    keyboard.text(title, letter).row()
  })

  await ctx.reply(REPLY_MESSAGE.MASS_MESSAGE_SELECT_GROUP, { reply_markup: keyboard })

  app.steps.set(ctx.from.id, askMessageToSend)
}
