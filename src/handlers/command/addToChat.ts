import type { Context } from 'grammy'
import type { AppContext } from '@/core/appContext'
import { getChatList, updateChatList } from '@/infrastructure/google-sheets'
import { REPLY_MESSAGE } from '@/shared/consts'

export async function handleAddToChat(app: AppContext, ctx: Context) {
  const newMembers = ctx.message?.new_chat_members
  const isBotAdded = newMembers?.some(member => member.is_bot && member.id === ctx.me.id)

  if (!isBotAdded)
    return

  const chatList = await getChatList(app.sheets)
  const newEntry = `${ctx.chat.title} ID:${ctx.chat.id}`
  if (chatList.includes(newEntry))
    return
  chatList.push(newEntry)

  await updateChatList(app.sheets, chatList)
  await ctx.reply(REPLY_MESSAGE.ADD_TO_CHAT_SUCCESS)

  app.logger.info(`Добавлен чат ${newEntry}`)
}
