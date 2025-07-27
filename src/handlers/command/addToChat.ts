import { AppContext } from "@/core/appContext";
import { getChatList, updateChatList } from "@/infrastructure/google-sheets";
import { REPLY_MESSAGE } from "@/shared/consts";
import { Context } from "grammy";

export async function handleAddToChat(app: AppContext, ctx: Context) {
  const newMembers = ctx.message?.new_chat_members;
  const isBotAdded = newMembers?.some(member => member.is_bot && member.id === ctx.me.id);

  if (!isBotAdded) return;

  try {
    const chatList = await getChatList(app.sheets);
    const newEntry = `${ctx.chat.title} ID:${ctx.chat.id}`;
    chatList.push(newEntry);

    await updateChatList(app.sheets, chatList);
    await ctx.reply(REPLY_MESSAGE.ADD_TO_CHAT_SUCCESS);
  } catch (err) {
    app.logger.error("handleAddToChat", { err });
  }
}
