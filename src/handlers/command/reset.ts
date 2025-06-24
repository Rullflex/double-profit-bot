import { AppContext } from "@/core/appContext";
import { Context } from "grammy";

export async function handleReset(app: AppContext, ctx: Context) {
  if (ctx.from?.id) {
    app.steps.delete(ctx.from.id);
  }
  ctx.reply("Состояние сброшено. Напечатай / чтобы увидеть список команд.");
}