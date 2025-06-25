

import { AppContext } from "@/core/appContext";
import { getChatList, updateChatList } from "@/infrastructure/google-sheets";
import { Context } from "grammy";

export async function handleChangeChatId(app: AppContext, ctx: Context) {
  const migrateFromId = ctx.message?.migrate_from_chat_id;
  const migrateToId = ctx.message?.migrate_to_chat_id;

  if (!migrateFromId || !migrateToId || !ctx.chat?.title) return;

  try {
    // Load the current chat list from Google Sheets
    const chatList = await getChatList(app.sheets);
    // Find and update the entry with the old chat ID to the new chat ID
    const updatedList = chatList.map(item =>
      item.includes(String(migrateFromId))
        ? `${ctx.chat.title} ID:${migrateToId}`
        : item
    );
    // Save the updated list back to Google Sheets
    await updateChatList(app.sheets, updatedList);
  } catch (err) {
    // Log errors if any occur
    app.logger.error("handleChangeChatId", { err });
  }
}