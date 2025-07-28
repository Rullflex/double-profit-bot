import { createAppContext } from "@/core/appContext";
import { handleAddToChat, handleChangeChatId, handleChangeChatTitle, handleRemoveFromChat } from "@/handlers/command";
import process from "node:process";

async function main() {
  const app = await createAppContext();

  app.externalBot.on("message:new_chat_members", handleAddToChat.bind(null, app));
  app.externalBot.on("message:left_chat_member", handleRemoveFromChat.bind(null, app));
  app.externalBot.on("message:new_chat_title", handleChangeChatTitle.bind(null, app));
  app.externalBot.on("message", async (ctx) => {
    if (ctx.message?.migrate_from_chat_id && ctx.message.migrate_to_chat_id) {
      await handleChangeChatId(app, ctx);
    }
  });

  app.externalBot.catch((err) => app.logger.error("External Bot error:", err));

  await app.externalBot.start({
    allowed_updates: ["message"],
    drop_pending_updates: true,
  });
}

main();
