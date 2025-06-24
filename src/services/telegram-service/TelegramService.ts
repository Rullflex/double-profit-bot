import { Api } from "grammy";
import { LoggerService } from "../logger-service";
import { sleep } from "@/shared/utils";
import fetch from "node-fetch";

export class TelegramService {
  private logger = new LoggerService("TelegramService");
  private  maxAttempts = 6;
  private  defaultDelay = 15000;

  constructor(private readonly api: Api, options?: { maxAttempts?: number; defaultDelay?: number }) {
    // настройки для функции sendMessageWithRetry, пока так
    this.maxAttempts = options?.maxAttempts || this.maxAttempts;
    this.defaultDelay = options?.defaultDelay || this.defaultDelay;
  }

  async sendMessageWithRetry(...args: Parameters<Api["sendMessage"]>): Promise<void> {
    const [chatId, text] = args;
    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      try {
        await this.api.sendMessage(...args);
        this.logger.debug(`Message <${text}> sent successfully to <${chatId}>`);
        return;
      } catch (err: any) {
        this.logger.warn(`Send attempt ${attempt + 1} failed: `, err?.message || err?.description || err);

        if (err?.description?.includes("Too Many Requests: retry after")) {
          const match = err.description.match(/retry after (\d+)/i);
          const retryAfter = match ? parseInt(match[1], 10) * 1000 : this.defaultDelay;
          this.logger.warn(`Rate limited. Retrying after ${retryAfter}ms`);
          await sleep(retryAfter);
        } else {
          await sleep(this.defaultDelay);
        }
      }
    }

    this.logger.error(`Failed to send message to ${chatId} after ${this.maxAttempts} attempts`);
    throw new Error("Failed to send message after retries.");
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