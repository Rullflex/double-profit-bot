import { AppContext } from "@/core/appContext";
import { getChatList, updateChatList } from "@/infrastructure/google-sheets";
import { Context } from "grammy";

export async function handleRemoveFromChat(app: AppContext, ctx: Context) {
  const left = ctx.message?.left_chat_member;
  const chatId = ctx.chat?.id;

  if (!left?.is_bot || left.id !== ctx.me.id || !chatId) return;

  try {
    const chatList = await getChatList(app.sheets);
    const filteredList = chatList.filter(item => !item.includes(String(chatId)));

    await updateChatList(app.sheets, filteredList);
  } catch (err) {
    app.logger.error("handleRemoveFromChat", { err });
  }
}
