import { AppContext } from "@/core/appContext";
import { Context } from "grammy";

export async function handleReset(app: AppContext, ctx: Context) {
  if (ctx.from?.id) {
    app.steps.delete(ctx.from.id);
  }
  ctx.reply("Все данные сброшены. Вы можете начать заново с / чтобы увидеть список команд.");
}