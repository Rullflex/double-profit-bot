import type { Context } from 'grammy'

export async function handleStart(ctx: Context) {
  await ctx.reply('Привет! Я готов к работе 🚀')
}
