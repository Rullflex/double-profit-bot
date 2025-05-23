import { sheets_v4 } from "googleapis";
import { DATA_SPREADSHEET_ID } from "./sheets.config";

export type CustomerData = {
  title: string;
  gLink: string;
  thresholdBalance: number;
  telegramChatRaw: string;
};

const CUSTOMER_DATA_RANGE = "TelegramBot!K3:N";

export async function getCustomerData(
  sheets: sheets_v4.Sheets,
): Promise<CustomerData[]> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: DATA_SPREADSHEET_ID,
    range: CUSTOMER_DATA_RANGE,
    valueRenderOption: "UNFORMATTED_VALUE",
  });

  const values = response.data.values ?? [];

  const customerList: CustomerData[] = [];

  for (const row of values) {
    if (row.length < 4) {
      throw new Error(`bad value length, row: ${JSON.stringify(row)}`);
    }

    const [title, gLink, threshold, chatRaw] = row;

    if (typeof title !== "string") {
      throw new Error(`invalid title type, row: ${JSON.stringify(row)}`);
    }
    if (typeof gLink !== "string") {
      throw new Error(`invalid gLink type, row: ${JSON.stringify(row)}`);
    }
    if (typeof threshold !== "number") {
      throw new Error(`invalid thresholdBalance type, row: ${JSON.stringify(row)}`);
    }
    if (typeof chatRaw !== "string") {
      throw new Error(`invalid telegramChatRaw type, row: ${JSON.stringify(row)}`);
    }

    customerList.push({
      title,
      gLink,
      thresholdBalance: threshold,
      telegramChatRaw: chatRaw,
    });
  }

  return customerList;
}