import { AppContext } from "@/core/appContext";
import { Context } from "grammy";
import { sendMassMessage } from "./sendMassMessage";
import { REPLY_MESSAGE } from "@/shared/consts";

export async function askMessageToSend(app: AppContext, ctx: Context) {
  const rangeLetter = ctx.callbackQuery?.data;
  if (!rangeLetter) {
    app.logger.withPrefix("askMessageToSend").error("Не указан диапазон для рассылки");
    return;
  }

  // Удаляем сообщение с кнопками
  if (ctx.callbackQuery?.message) {
    await ctx.api.deleteMessage(ctx.chat.id, ctx.callbackQuery.message.message_id);
  }

  await ctx.reply(REPLY_MESSAGE.MASS_MESSAGE_SEND_MESSAGE);

  app.steps.set(ctx.from.id, sendMassMessage.bind(null, rangeLetter));
}