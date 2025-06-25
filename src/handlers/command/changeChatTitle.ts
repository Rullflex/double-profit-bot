import { AppContext } from "@/core/appContext";
import { getChatList, updateChatList } from "@/infrastructure/google-sheets";
import { Context } from "grammy";

export async function handleChangeChatTitle(app: AppContext, ctx: Context) {
  const chatId = ctx.chat?.id;
  const newTitle = ctx.message?.new_chat_title;

  if (!chatId || !newTitle) return;

  try {
    const chatList = await getChatList(app.sheets);
    const updatedList = chatList.map(item =>
      item.includes(String(chatId)) ? `${newTitle} ID:${chatId}` : item
    );

    await updateChatList(app.sheets, updatedList);
  } catch (err) {
    app.logger.error("handleChangeChatTitle", { err });
  }
}
