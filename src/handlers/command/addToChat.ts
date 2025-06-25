import { AppContext } from "@/core/appContext";
import { getChatList, updateChatList } from "@/infrastructure/google-sheets";
import { Context } from "grammy";

const helloString = `
Всем привет!
Контакт установлен
👉👈`;

export async function handleAddToChat(app: AppContext, ctx: Context) {
  const newMembers = ctx.message?.new_chat_members;
  const isBotAdded = newMembers?.some(member => member.is_bot && member.id === ctx.me.id);

  if (!isBotAdded) return;

  try {
    const chatList = await getChatList(app.sheets);
    const newEntry = `${ctx.chat.title} ID:${ctx.chat.id}`;
    chatList.push(newEntry);

    await updateChatList(app.sheets, chatList);
    await app.telegramService.sendMessageWithRetry(ctx.chat.id, helloString);
  } catch (err) {
    app.logger.error("handleAddToChat", { err });
  }
}
