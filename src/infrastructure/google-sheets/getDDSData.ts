import type { sheets_v4 } from 'googleapis'

export interface DDsData {
  title: string
  money: number
  description: string
  currentRemain: number
}

const DDS_LIST_NAME = 'Движение денежных средств'

export async function getDDSData(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  lastCheckedRow: number,
): Promise<{ currentChanges: DDsData[] }> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${DDS_LIST_NAME}!A${lastCheckedRow}:I`,
    valueRenderOption: 'UNFORMATTED_VALUE',
  })

  const changesValues = response.data.values ?? []

  const currentChanges: DDsData[] = changesValues.map((el) => {
    const title = typeof el[0] === 'string' ? el[0] : ''
    const money = typeof el[3] === 'number' ? el[3] : 0
    const description = typeof el[4] === 'string' ? el[4] : ''
    const currentRemain = typeof el[8] === 'number' ? el[8] : 0
    return { title, money, description, currentRemain }
  })

  return { currentChanges }
}
