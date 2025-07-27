import { Api } from "grammy";
import fetch from "node-fetch";
import { sleep } from "@/shared/utils";

export async function sendMessageWithRetry(api: Api, ...args: Parameters<Api["sendMessage"]>): Promise<void> {
  const maxAttempts = 6;
  const delay = 15000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await api.sendMessage(...args);
      return;
    } catch (err: any) {
      if (err?.description?.includes("Too Many Requests: retry after")) {
        const match = err.description.match(/retry after (\d+)/i);
        const retryAfter = match ? parseInt(match[1], 10) * 1000 : delay;
        await sleep(retryAfter);
      } else {
        await sleep(delay);
      }
    }
  }

  throw new Error("Failed to send message after retries.");
}

export async function getFileBuffer(api: Api, fileId: string): Promise<Buffer> {
  const file = await api.getFile(fileId);
  const filePath = file.file_path;

  if (!filePath) throw new Error("File path is undefined");

  const response = await fetch(`https://api.telegram.org/file/bot${api.token}/${filePath}`);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}