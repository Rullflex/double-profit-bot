import { sheets_v4 } from "googleapis";

const CHAT_GROUP_LIST_FIRST_ROW = 3;
const chatGroupListRange = `TelegramBot!D${CHAT_GROUP_LIST_FIRST_ROW}:I${CHAT_GROUP_LIST_FIRST_ROW}`;

export async function getChatGroupList(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string
): Promise<string[]> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: chatGroupListRange,
    valueRenderOption: "UNFORMATTED_VALUE",
  });

  const row = response.data.values?.[0] ?? [];

  return row.filter((val): val is string => typeof val === "string");
}