import { AppContext } from "@/core/appContext";
import { getChatList, updateChatList } from "@/infrastructure/google-sheets";
import { Context } from "grammy";

export async function handleRemoveFromChat(app: AppContext, ctx: Context) {
  const left = ctx.message?.left_chat_member;
  const chatId = ctx.chat?.id;

  if (!left?.is_bot || left.id !== ctx.me.id || !chatId) return;

  const chatList = await getChatList(app.sheets);
  const filteredList = chatList.filter(item => !item.includes(String(chatId)));

  // Добавляем пустые строки, чтобы затереть старые данные в Google Sheets
  while (filteredList.length < chatList.length) {
    filteredList.push("");
  }

  await updateChatList(app.sheets, filteredList);

  app.logger.info(`Удален чат ID:${chatId}`);
}
