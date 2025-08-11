import { Api, Context } from "grammy";
import fetch from "node-fetch";

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

// TODO - надо еще проверить на то чтобы интервал очищался и очищать его при ошибках, а то висеть будет
export function createProgressMessage(ctx: Context, initialMessage: string, intervalMs = 1000) {
  let animationInterval: NodeJS.Timeout | null = null;
  let currentMessage = initialMessage;
  let dotsCount = 0;

  const sendInitial = async () => {
    const sent = await ctx.reply(currentMessage);
    return sent;
  };

  let sentMessagePromise = sendInitial();

  const update = async (message: string) => {
    currentMessage = message;
    dotsCount = 0;
    const sent = await sentMessagePromise;
    if (animationInterval) {
      clearInterval(animationInterval);
    }
    await ctx.api.editMessageText(sent.chat.id, sent.message_id, currentMessage);
    animationInterval = setInterval(async () => {
      dotsCount = (dotsCount + 1) % 4;
      const dots = '.'.repeat(dotsCount);
      await ctx.api.editMessageText(sent.chat.id, sent.message_id, currentMessage + dots);
    }, intervalMs);
  };

  const stop = () => {
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
    }
  };

  return {
    update,
    stop,
    sentMessagePromise,
  };
}