import { Api } from "grammy";
import { LoggerService } from "../logger-service";
import { sleep } from "@/shared/utils";
import fetch from "node-fetch";

export class TelegramService {
  private logger = new LoggerService("TelegramService");

  constructor(private readonly api: Api) {}

  async sendMessageWithRetry(
    chatId: number | string,
    text: string,
    maxAttempts = 6,
    defaultDelay = 15000
  ): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        await this.api.sendMessage(chatId, text);
        this.logger.debug(`Message <${text}> sent successfully to <${chatId}>`);
        return;
      } catch (err: any) {
        this.logger.warn(`Send attempt ${attempt + 1} failed: `, err?.message || err?.description || err);

        if (err?.description?.includes("Too Many Requests: retry after")) {
          const match = err.description.match(/retry after (\d+)/i);
          const retryAfter = match ? parseInt(match[1], 10) * 1000 : defaultDelay;
          this.logger.warn(`Rate limited. Retrying after ${retryAfter}ms`);
          await sleep(retryAfter);
        } else {
          await sleep(defaultDelay);
        }
      }
    }

    this.logger.error(`Failed to send message to ${chatId} after ${maxAttempts} attempts`);
    throw new Error("Failed to send message after retries.");
  }

  extractChatID(rawChatData: string): number {
    const prefix = "ID:";
    const index = rawChatData.lastIndexOf(prefix);
    if (index !== -1 && index + prefix.length < rawChatData.length) {
      const idStr = rawChatData.slice(index + prefix.length).trim();
      const id = parseInt(idStr, 10);
      if (isNaN(id)) {
        this.logger.error("Invalid chat ID format:", idStr);
        throw new Error("Invalid chat ID format");
      }
      return id;
    }
    this.logger.error("Chat ID not found in raw string:", rawChatData);
    throw new Error("Chat ID not found in string");
  }

  async getFile(fileId: string): Promise<Buffer> {
    const file = await this.api.getFile(fileId);
    const filePath = file.file_path;

    if (!filePath) {
      throw new Error("File path is undefined");
    }

    const response = await fetch(`https://api.telegram.org/file/bot${this.api.token}/${filePath}`);
    if (!response.ok) {
      this.logger.error(`Failed to download file: ${response.statusText}`);
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}