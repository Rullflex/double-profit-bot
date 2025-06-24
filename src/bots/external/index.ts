import { createAppContext } from "@/core/appContext";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const app = await createAppContext(process.env.EXTERNAL_BOT_TOKEN);
  await app.bot.start();
  app.logger.log("🤖 External Бот запущен");
}

main();
