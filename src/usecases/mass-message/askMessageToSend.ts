import type { Context } from 'grammy'
import type { AppContext } from '@/core/appContext'
import { REPLY_MESSAGE } from '@/shared/consts'
import { sendMassMessage } from './sendMassMessage'

export async function askMessageToSend(app: AppContext, ctx: Context) {
  const rangeLetter = ctx.callbackQuery?.data

  if (!rangeLetter) {
    throw new Error('Не удалось получить букву диапазона')
  }

  // Удаляем сообщение с кнопками
  if (ctx.callbackQuery?.message) {
    await ctx.api.deleteMessage(ctx.chat.id, ctx.callbackQuery.message.message_id)
  }

  await ctx.reply(REPLY_MESSAGE.MASS_MESSAGE_SEND_MESSAGE)

  app.steps.set(ctx.from.id, sendMassMessage.bind(null, rangeLetter))
}
