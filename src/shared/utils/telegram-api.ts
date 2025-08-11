import { Api } from "grammy";
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