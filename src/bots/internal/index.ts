import { createAppContext } from "@/core/appContext";
import dotenv from "dotenv";
import { handleElama, handleReset, handleStart } from "@/handlers/command";
import { dailyReportEntrypoint } from "@/usecases/daily-report";
import { massMessageEntrypoint } from "@/usecases/mass-message";

dotenv.config();

async function main() {
  const app = await createAppContext(process.env.INTERNAL_BOT_TOKEN);

  await app.bot.api.setMyCommands([
    { command: "start", description: "Запустить бота" },
    { command: "elama", description: "Загрузить файл eLama" },
    { command: "dailyreport", description: "Отчёт по дням" },
    { command: "massmessage", description: "Массовая рассылка" },
    { command: "reset", description: "Сбросить состояние" },
  ]);

  app.bot.command("start", handleStart);
  app.bot.command("elama", handleElama.bind(null, app));
  app.bot.command("dailyreport", dailyReportEntrypoint.bind(null, app));
  app.bot.command("massmessage", massMessageEntrypoint.bind(null, app));
  app.bot.command("reset", handleReset.bind(null, app));

  app.bot.on(["message:text", "callback_query:data"], async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const step = app.steps.get(userId);

    if (step) {
      await step(app, ctx);
      return;
    }

    await ctx.reply("Я вас не понял. Введите / чтобы увидеть список команд");
  });

  app.logger.log("🤖 Internal Бот запущен");

  await app.bot.start();
}

main();
