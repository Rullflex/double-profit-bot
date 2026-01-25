import type { AppContext } from '@/core'
import process from 'node:process'
import { Bot } from 'grammy'
import { handleAddToChat, handleChangeChatId, handleChangeChatTitle, handleRemoveFromChat } from '@/handlers/command'

export async function registerExternalBot(app: AppContext) {
  const bot = new Bot(process.env.EXTERNAL_BOT_TOKEN)

  bot.api.setMyCommands([])

  bot.on('message:new_chat_members', handleAddToChat.bind(null, app))
  bot.on('message:left_chat_member', handleRemoveFromChat.bind(null, app))
  bot.on('message:new_chat_title', handleChangeChatTitle.bind(null, app))
  bot.on('message', async (ctx) => {
    if (ctx.message?.migrate_from_chat_id && ctx.message.migrate_to_chat_id) {
      await handleChangeChatId(app, ctx)
    }
  })

  bot.catch(e => app.logger.error(e))

  await bot.start({
    allowed_updates: ['message'],
    drop_pending_updates: true,
  })
}
