import type { Context } from 'grammy'
import type { AppContext } from '@/core/appContext'
import type { RemainsTaskResult } from '@/tasks/remains'
import { REPLY_MESSAGE } from '@/shared/consts'
import { TaskName } from '@/tasks'

export async function handleExecuteRemainsTask(app: AppContext, ctx: Context) {
  await ctx.reply(REPLY_MESSAGE.TASK_EXECUTING)
  const result: RemainsTaskResult = await app.tasks.get(TaskName.REMAINS).execute()
  await ctx.reply(`${REPLY_MESSAGE.TASK_EXECUTED}\n${REPLY_MESSAGE.ELAMA_SUCCESS_UPDATE(result.updatedCount)}`)
}
