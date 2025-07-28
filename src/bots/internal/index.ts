import { createAppContext } from "@/core/appContext";
import { handleElama, handleReset, handleStart } from "@/handlers/command";
import { handleStepIfExists } from "@/handlers/message";
import { dailyReportEntrypoint } from "@/usecases/daily-report";
import { massMessageEntrypoint } from "@/usecases/mass-message";
import { internalCommandList, InternalCommand } from "./const";
import { REPLY_MESSAGE } from "@/shared/consts";

async function main() {
  const app = await createAppContext({
    botToken: process.env.INTERNAL_BOT_TOKEN,
    loggerLabel: "internal",
  });

  await app.bot.api.setMyCommands(internalCommandList);

  app.bot.command(InternalCommand.START, handleStart);
  app.bot.command(InternalCommand.ELAMA, handleElama.bind(null, app));
  app.bot.command(InternalCommand.DAILYREPORT, dailyReportEntrypoint.bind(null, app));
  app.bot.command(InternalCommand.MASSMESSAGE, massMessageEntrypoint.bind(null, app));
  app.bot.command(InternalCommand.RESET, handleReset.bind(null, app));

  app.bot.on(["message", "callback_query:data"], async (ctx) => {
    const handled = await handleStepIfExists(ctx, app);

    if (!handled) {
      await ctx.reply(REPLY_MESSAGE.UNKNOWN_COMMAND);
    }
  });

  app.bot.catch(app.logger.error);

  await app.bot.start({
    drop_pending_updates: true,
  });
}

main();
