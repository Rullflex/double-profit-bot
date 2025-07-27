import { createAppContext } from "@/core/appContext";
import { handleElama, handleReset, handleStart } from "@/handlers/command";
import { handleStepIfExists } from "@/handlers/message";
import { dailyReportEntrypoint } from "@/usecases/daily-report";
import { massMessageEntrypoint } from "@/usecases/mass-message";
import { internalCommandList, InternalCommand } from "./const";
import { REPLY_MESSAGE } from "@/shared/consts";

async function main() {
  const app = await createAppContext();

  await app.internalBot.api.setMyCommands(internalCommandList);

  app.internalBot.command(InternalCommand.START, handleStart);
  app.internalBot.command(InternalCommand.ELAMA, handleElama.bind(null, app));
  app.internalBot.command(InternalCommand.DAILYREPORT, dailyReportEntrypoint.bind(null, app));
  app.internalBot.command(InternalCommand.MASSMESSAGE, massMessageEntrypoint.bind(null, app));
  app.internalBot.command(InternalCommand.RESET, handleReset.bind(null, app));

  app.internalBot.on(["message", "callback_query:data"], async (ctx) => {
    const handled = await handleStepIfExists(ctx, app);

    if (!handled) {
      await ctx.reply(REPLY_MESSAGE.UNKNOWN_COMMAND);
    }
  });

  app.internalBot.catch((err) => app.logger.error("Internal Bot error:", err));

  await app.internalBot.start({
    drop_pending_updates: true,
  });
}

main();
