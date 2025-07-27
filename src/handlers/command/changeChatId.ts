

import { AppContext } from "@/core/appContext";
import { getChatList, updateChatList } from "@/infrastructure/google-sheets";
import { Context } from "grammy";

export async function handleChangeChatId(app: AppContext, ctx: Context) {
  const migrateFromId = ctx.message?.migrate_from_chat_id;
  const migrateToId = ctx.message?.migrate_to_chat_id;

  if (!migrateFromId || !migrateToId || !ctx.chat?.title) return;
  const chatList = await getChatList(app.sheets);

  const updatedList = chatList.map(item =>
    item.includes(String(migrateFromId))
      ? `${ctx.chat.title} ID:${migrateToId}`
      : item
  );

  await updateChatList(app.sheets, updatedList);
}