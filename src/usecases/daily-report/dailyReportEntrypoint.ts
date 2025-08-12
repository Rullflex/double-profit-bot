import { AppContext } from "@/core/appContext";
import { getCustomerData, getMoneyRemainData } from "@/infrastructure/google-sheets";
import { extractChatId } from "@/infrastructure/google-sheets";
import { REPLY_MESSAGE } from "@/shared/consts";
import { Context } from "grammy";

export async function dailyReportEntrypoint(app: AppContext, ctx: Context) {
  const chatId = ctx.chat?.id;
  const userId = ctx.from?.id;
  if (!userId || !chatId) return;

  const statusInterval = setInterval(() => {
    ctx.reply(REPLY_MESSAGE.DAILY_REPORT_IN_PROGRESS);
  }, 18000);

  try {
    const customers = await getCustomerData(app.sheets);
    const remainData = await getMoneyRemainData(app.sheets);

    const remainMap = new Map<string, typeof remainData[0]>();
    remainData.forEach(data => remainMap.set(data.title, data));

    const tasks: Promise<void>[] = [];
    let successCount = 0;

    for (const customer of customers) {
      const remain = remainMap.get(customer.title);
      if (!remain) continue;

      const customerChatId = extractChatId(customer.telegramChatRaw);;
      const needWarning = remain.ipRemain < customer.thresholdBalance;
      const message = buildMessage(customer.title, remain.ipRemain, remain.elamaRemain, needWarning);

      tasks.push(
        app.notificationBotApi.sendMessage(customerChatId, message).then(() => { successCount++; })
      );
    }

    // Add a timeout for all tasks (90 seconds)
    let timeoutId: NodeJS.Timeout;
    const timeout = new Promise<void>((_, reject) => { timeoutId = setTimeout(() => reject(new Error("Timeout")), 90000) });
    await Promise.race([Promise.all(tasks), timeout]);
    timeoutId ?? clearTimeout(timeoutId);

    const finalMessage = successCount < tasks.length ? REPLY_MESSAGE.DAILY_REPORT_FAIL : REPLY_MESSAGE.DAILY_REPORT_SUCCESS;
    await ctx.reply(finalMessage);
  } finally {
    clearInterval(statusInterval);
  }
}

function buildMessage(customerTitle: string, ipRemain: number, elamaRemain: number, needWarning: boolean): string {
  const suffix = needWarning ? `(❗️нужно пополнить❗️)` : "";
  const date = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
  return `${date}
${customerTitle}
Остаток елама: ${Math.round(elamaRemain)} ₽.
Остаток DP-Marketing: ${Math.round(ipRemain)} ₽. ${suffix}`;
}