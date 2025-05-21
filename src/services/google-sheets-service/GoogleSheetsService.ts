import { google, sheets_v4 } from "googleapis";
import { authorize } from "./authorize";

let cachedSheetsClient: sheets_v4.Sheets | null = null;

// TODO: подумать как иначе использовать сущьность чтобы избавиться от await
export async function getSheetsClient(): Promise<sheets_v4.Sheets> {
  if (!cachedSheetsClient) {
    const authClient = await authorize();
    cachedSheetsClient = google.sheets({ version: "v4", auth: authClient });
  }

  return cachedSheetsClient;
}