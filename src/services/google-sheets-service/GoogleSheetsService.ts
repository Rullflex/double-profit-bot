import { google, sheets_v4 } from "googleapis";
import { authorize } from "./authorize";

let cachedSheetsClient: sheets_v4.Sheets | null = null;

export async function getSheetsClient(): Promise<sheets_v4.Sheets> {
  if (!cachedSheetsClient) {
    const auth = await authorize();
    cachedSheetsClient = google.sheets({ version: "v4", auth });
  }

  return cachedSheetsClient;
}

export function extractChatId(rawChatData: string): number {
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
