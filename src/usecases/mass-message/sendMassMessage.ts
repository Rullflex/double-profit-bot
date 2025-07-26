import { AppContext } from "@/core/appContext";
import { getChatList, getChatListByGroup } from "@/infrastructure/google-sheets";
import { extractChatId } from "@/infrastructure/google-sheets";
import { REPLY_MESSAGE } from "@/shared/consts";
import { Context } from "grammy";

export async function sendMassMessage(rangeLetter: string, app: AppContext, ctx: Context) {
  if (!rangeLetter || !ctx.message?.text) return;

  const chatList = rangeLetter === "all"
    ? await getChatList(app.sheets)
    : await getChatListByGroup(app.sheets, rangeLetter);

  let successCount = 0;
  await Promise.all(
    chatList.map(async (chatRaw) => {
      try {
        const chatId = extractChatId(chatRaw);
        await app.telegramService.sendMessageWithRetry(chatId, ctx.message.text);
        successCount++;
      } catch (err) {
        app.logger.error("Ошибка отправки", { err, chatRaw });
      }
    })
  );

  await ctx.reply(REPLY_MESSAGE.MASS_MESSAGE_SEND_SUCCESS(successCount));

  app.steps.delete(ctx.from.id);
}
