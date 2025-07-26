import { AppContext } from "@/core/appContext";
import { REPLY_MESSAGE } from "@/shared/consts";
import { Context } from "grammy";

export async function handleReset(app: AppContext, ctx: Context) {
  app.steps.delete(ctx.from.id);
  ctx.reply(REPLY_MESSAGE.RESET_COMMAND);
}