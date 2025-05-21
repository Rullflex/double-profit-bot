import { Api } from "grammy";
import { sleep } from "@/shared/utils";

export class TelegramService {
  constructor(private readonly api: Api) {}

  async sendMessageWithRetry(
    chatId: number | string,
    text: string,
    maxAttempts = 6,
    defaultDelay = 15000
  ): Promise<void> {
    let attempt = 0;

    while (attempt < maxAttempts) {
      try {
        await this.api.sendMessage(chatId, text);
        return;
      } catch (err: any) {
        console.warn(`[TelegramService] Send attempt ${attempt + 1} failed:`, err?.message);

        if (err?.description?.includes("Too Many Requests: retry after")) {
          const match = err.description.match(/retry after (\d+)/i);
          const retryAfter = match ? parseInt(match[1], 10) * 1000 : defaultDelay;
          console.log(`[TelegramService] Rate limited. Sleeping for ${retryAfter} ms`);
          await sleep(retryAfter);
        } else {
          await sleep(defaultDelay);
        }

        attempt++;
      }
    }

    throw new Error("Failed to send message after retries.");
  }

  extractChatID(rawChatData: string): number {
    const prefix = "ID:";
    const index = rawChatData.lastIndexOf(prefix);
    if (index !== -1 && index + prefix.length < rawChatData.length) {
      const idStr = rawChatData.slice(index + prefix.length).trim();
      const id = parseInt(idStr, 10);
      if (isNaN(id)) {
        throw new Error("Invalid chat ID format");
      }
      return id;
    }
    throw new Error("Chat ID not found in string");
  }
}