import { createAppContext } from "@/core/appContext";
import { handleAddToChat, handleChangeChatId, handleChangeChatTitle, handleRemoveFromChat } from "@/handlers/command";
import { createDdsNotificatorUsecase } from "@/usecases/dds-notificator";
import process from "node:process";

async function main() {
  const app = await createAppContext();

  const dds = createDdsNotificatorUsecase(app);
  await dds.readJsonData(app.ctx);
  dds.start(app.ctx);

  app.externalBot.on("message:new_chat_members", handleAddToChat.bind(null, app));
  app.externalBot.on("message:left_chat_member", handleRemoveFromChat.bind(null, app));
  app.externalBot.on("message:new_chat_title", handleChangeChatTitle.bind(null, app));
  app.externalBot.on("message", async (ctx) => {
    if (ctx.message?.migrate_from_chat_id && ctx.message.migrate_to_chat_id) {
      await handleChangeChatId(app, ctx);
    }
  });

  await app.externalBot.start({
    allowed_updates: ["message"],
    drop_pending_updates: true,
  });

  // Грейсфул шутдаун
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
  for (const sig of signals) {
    process.once(sig, () => {
      app.logger.log(`🚦 Signal received: ${sig}`);
      app.ctx.cancel();
    });
  }
}

main();
