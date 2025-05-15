import { Context } from 'telegraf';
import { setUserState } from '../storage';

export async function handleElama(ctx: Context) {
  await setUserState(ctx.from!.id, 'elama');
  await ctx.reply('Ожидаю ввод данных для elama...');
}