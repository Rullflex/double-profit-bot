import { AppContext } from "@/core/appContext";
import { getChatList, getChatListByGroup } from "@/infrastructure/google-sheets";
import { extractChatId } from "@/services/google-sheets-service";
import { plural } from "@/shared/utils";
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

  const reply = `Сообщение успешно отправлено в ${successCount} ${plural(successCount, ['чат', 'чата', 'чатов'])}`;
  await ctx.reply(reply);

  app.steps.delete(ctx.from.id);
}
