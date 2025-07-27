

import fs from "fs/promises";
import path from "path";
import { AppContext } from "@/core/appContext";
import { DDsData, getCustomerData, getDDSData } from "@/infrastructure/google-sheets";
import { extractChatId } from "@/infrastructure/google-sheets";
import { extractSheetIdFromGLink } from "@/services/google-sheets-service";
import { sendMessageWithRetry } from "@/shared/utils";

export interface DdsNotificator {
  readJsonData(ctx: AppContext["ctx"]): Promise<void>;
  start(ctx: AppContext["ctx"]): void;
}

type RowMap = Record<string, number>;

export function createDdsNotificatorUsecase(app: AppContext): DdsNotificator {
  const filePath = path.join(import.meta.dirname, "dds-last-state.json");
  const rowMap: RowMap = {};

  return {
    async readJsonData(ctx) {
      const content = await fs.readFile(filePath, "utf-8");
      if (!content) return;
      const parsed = JSON.parse(content);
      Object.assign(rowMap, parsed);
    },

    start(ctx) {
      const interval = 90_000;
      const configInterval = 60_000; // Can be read from .env or app.config

      async function writeJsonData() {
        await fs.writeFile(filePath, JSON.stringify(rowMap), { mode: 0o700 });
      }

      async function run() {
        while (!ctx.signal.aborted) {
          const customers = await getCustomerData(app.sheets);
          const delay = configInterval / (customers.length + 1);

          for (const customer of customers) {
            await new Promise(r => setTimeout(r, delay));

            const sheetId = extractSheetIdFromGLink(customer.gLink);
            let lastCheckedRow = rowMap[sheetId] || 8;

            const { currentChanges: changes, currentRemain: lastRemain } = await getDDSData(
              app.sheets,
              sheetId,
              `ДДС!A${lastCheckedRow}:G`
            );

            if (!changes.length) continue;

            const chatId = extractChatId(customer.telegramChatRaw);
            const messages: string[] = [];

            let remain = lastRemain;
            for (let i = changes.length - 1; i >= 0; i--) {
              const msg = formatMessage(customer.title, changes[i], remain);
              messages.push(msg);
              remain -= changes[i].money;
            }

            for (const msg of messages) {
              await sendMessageWithRetry(app.externalBot.api, chatId, msg);
              lastCheckedRow++;
            }

            rowMap[sheetId] = lastCheckedRow;
            await writeJsonData();
          }

          await new Promise(r => setTimeout(r, interval));
        }
      }

      run();
    },
  };
}

function formatMessage(customer: string, dds: DDsData, remain: number): string {
  const roundedRemain = Math.round(remain);
  const roundedMoney = Math.round(Math.abs(dds.money));
  const changeType = dds.money > 0 ? "Пополнение" : "Расход";
  return `${customer}
${changeType} на ${roundedMoney}р. ${dds.description}
Свободный остаток ${roundedRemain}р.`;
}