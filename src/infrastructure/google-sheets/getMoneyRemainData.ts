import { sheets_v4 } from "googleapis";
import { MONEY_SPREADSHEET_ID } from "./sheets.config";

export type MoneyRemainData = {
  title: string;
  elamaId: number;
  ipRemain: number;
  elamaRemain: number;
};

const MONEY_REMAIN_FIRST_ROW = 3;
const MONEY_REMAIN_RANGE = `Остатки!C${MONEY_REMAIN_FIRST_ROW}:G`;
const ELAMA_REMAIN_RANGE = `Остатки!G${MONEY_REMAIN_FIRST_ROW}:G`;
const UPDATE_TIME_RANGE = "Остатки!G1:G1";

export async function getMoneyRemainData(
  sheets: sheets_v4.Sheets,
): Promise<MoneyRemainData[]> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: MONEY_SPREADSHEET_ID,
    range: MONEY_REMAIN_RANGE,
    valueRenderOption: "UNFORMATTED_VALUE",
  });

  let rows = response.data.values ?? [];
  rows = rows.filter((row) => row.length > 0);
  const result: MoneyRemainData[] = [];

  for (const row of rows) {
    if (row.length < 4) {
      throw new Error(`Bad row length (не все ячейки заполнены): ${JSON.stringify(row)}`);
    }

    const title = typeof row[0] === "string" ? row[0] : "";
    if (!title) break;

    let elamaId = -1;
    if (typeof row[2] === "number") {
      elamaId = row[2];
    } else if (row[2] !== "-") {
      throw new Error(`Invalid elamaId: ${JSON.stringify(row)}`);
    }

    const ipRemain = typeof row[3] === "number" ? row[3] : (() => {
      throw new Error(`Invalid ipRemain: ${JSON.stringify(row)}`);
    })();

    const elamaRemain =
      (elamaId !== -1 && typeof row[4] === "number") ? row[4] : 0;

    result.push({
      title,
      elamaId,
      ipRemain,
      elamaRemain,
    });
  }

  return result;
}

export async function updateCommonMoneyRemain(
  sheets: sheets_v4.Sheets,
  moneyRemainData: MoneyRemainData[]
): Promise<void> {
  const elamaRemainRange: sheets_v4.Schema$ValueRange = {
    range: `${ELAMA_REMAIN_RANGE}${MONEY_REMAIN_FIRST_ROW + moneyRemainData.length - 1}`,
    values: moneyRemainData.map((item) => [item.elamaRemain]),
  };

  const updateTimeRange: sheets_v4.Schema$ValueRange = {
    range: UPDATE_TIME_RANGE,
    values: [[`${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })} MSK`]],
  };

  const request: sheets_v4.Schema$BatchUpdateValuesRequest = {
    data: [elamaRemainRange, updateTimeRange],
    valueInputOption: "USER_ENTERED",
  };

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: MONEY_SPREADSHEET_ID,
    requestBody: request,
  });
}