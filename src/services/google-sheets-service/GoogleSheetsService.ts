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