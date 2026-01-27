import type { sheets_v4 } from 'googleapis'

export interface DDsData {
  title: string
  money: number
  description: string
}

const DDS_LIST_NAME = 'Движение денежных средств'

export async function getDDSData(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  lastCheckedRow: number,
): Promise<{ currentChanges: DDsData[], currentRemain: number }> {
  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges: [`${DDS_LIST_NAME}!A${lastCheckedRow}:G`, `${DDS_LIST_NAME}!C4`],
    valueRenderOption: 'UNFORMATTED_VALUE',
  })

  const changesValues = response.data.valueRanges?.[0]?.values ?? []
  const remainValues = response.data.valueRanges?.[1]?.values ?? []

  const currentRemain = typeof remainValues[0]?.[0] === 'number' ? remainValues[0][0] : 0

  const currentChanges: DDsData[] = changesValues.map((el) => {
    const title = typeof el[0] === 'string' ? el[0] : ''
    const money = typeof el[3] === 'number' ? el[3] : 0
    const description = typeof el[4] === 'string' ? el[4] : ''
    return { title, money, description }
  })

  return { currentChanges, currentRemain }
}
