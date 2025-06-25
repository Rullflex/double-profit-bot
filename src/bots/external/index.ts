import { createAppContext } from "@/core/appContext";
import { handleAddToChat, handleChangeChatId, handleChangeChatTitle, handleRemoveFromChat } from "@/handlers/command";
import { createDdsNotificatorUsecase } from "@/usecases/dds-notificator";
import dotenv from "dotenv";
import process from "node:process";

dotenv.config();

async function main() {
  const app = await createAppContext(process.env.EXTERNAL_BOT_TOKEN!);

  // Инициализируем DDS usecase
  const dds = createDdsNotificatorUsecase(app);
  await dds.readJsonData(app.ctx);
  dds.start(app.ctx);

  // Регистрируем обработчики событий
  app.bot.on("message:new_chat_members", handleAddToChat.bind(null, app));
  app.bot.on("message:left_chat_member", handleRemoveFromChat.bind(null, app));
  app.bot.on("message:new_chat_title", handleChangeChatTitle.bind(null, app));
  app.bot.on("message", async (ctx) => {
    if (ctx.message?.migrate_from_chat_id && ctx.message.migrate_to_chat_id) {
      await handleChangeChatId(app, ctx);
    }
  });

  // Запуск прослушивания через вебхуки
  await app.bot.start({
    allowed_updates: ["message"],
    drop_pending_updates: true,
  });

  app.logger.log("🤖 External Бот запущен");

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
