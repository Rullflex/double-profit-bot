import { sheets_v4 } from "googleapis";

const CHAT_LIST_FIRST_ROW = 3;

export async function getChatList(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string
): Promise<string[]> {
  const range = `TelegramBot!B${CHAT_LIST_FIRST_ROW}:B`;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
    valueRenderOption: "UNFORMATTED_VALUE",
  });

  return (response.data.values ?? [])
    .map((row) => row[0])
    .filter((v): v is string => typeof v === "string");
}

export async function getChatListByGroup(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  rangeLetter: string
): Promise<string[]> {
  const range = `TelegramBot!${rangeLetter}${CHAT_LIST_FIRST_ROW + 1}:${rangeLetter}`;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
    valueRenderOption: "UNFORMATTED_VALUE",
  });

  return (response.data.values ?? [])
    .map((row) => row[0])
    .filter((v): v is string => typeof v === "string");
}

export async function updateChatList(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  chatList: string[]
): Promise<void> {
  const endRow = CHAT_LIST_FIRST_ROW + chatList.length - 1;
  const range = `TelegramBot!B${CHAT_LIST_FIRST_ROW}:B${endRow}`;
  const valueRange: sheets_v4.Schema$ValueRange = {
    range,
    values: chatList.map((item) => [item]),
  };

  const request: sheets_v4.Schema$BatchUpdateValuesRequest = {
    data: [valueRange],
    valueInputOption: "USER_ENTERED",
  };

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: request,
  });
}
