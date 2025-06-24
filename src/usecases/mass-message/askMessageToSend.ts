import { AppContext } from "@/core/appContext";
import { Context } from "grammy";
import { sendMassMessage } from "./sendMassMessage";
import { LoggerService } from "@/services";

const logger = new LoggerService("MassMessage");

export async function askMessageToSend(app: AppContext, ctx: Context) {
  const rangeLetter = ctx.callbackQuery?.data;
  if (!rangeLetter) {
    logger.error("Не указан диапазон для рассылки");
    return
  };

  await ctx.editMessageReplyMarkup(); // удалить inline-кнопки
  await ctx.reply("Теперь напиши сообщение для рассылки.");

  app.steps.set(ctx.from.id, sendMassMessage.bind(null, rangeLetter));
}