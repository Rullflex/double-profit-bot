import { Context } from 'telegraf';
import { loadData, saveData } from '../storage';

export async function handleReset(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const data = await loadData();
  const key = `nextFnForUser${userId}`;
  delete data[key];
  await saveData(data);

  await ctx.reply("Напечатай '/' чтобы увидеть список команд");
}