import type { Context } from 'grammy'
import type { AppContext } from '@/core/appContext'

export async function handleStepIfExists(ctx: Context, app: AppContext): Promise<boolean> {
  const userId = ctx.from?.id
  if (!userId)
    return false

  const step = app.steps.get(userId)
  if (!step)
    return false

  await step(app, ctx)
  return true
}
