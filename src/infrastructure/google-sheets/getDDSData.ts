import type { sheets_v4 } from 'googleapis'

export interface DDsData {
  title: string
  money: number
  description: string
}

const IP_REMAIN_RANGE = 'ДДС!D2'

export async function getDDSData(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  targetRange: string,
): Promise<{ currentChanges: DDsData[], currentRemain: number }> {
  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges: [targetRange, IP_REMAIN_RANGE],
    valueRenderOption: 'UNFORMATTED_VALUE',
  })

  const changesValues = response.data.valueRanges?.[0]?.values ?? []
  const remainValues = response.data.valueRanges?.[1]?.values ?? []

  const currentRemain = typeof remainValues[0]?.[0] === 'number' ? remainValues[0][0] : 0

  const currentChanges: DDsData[] = changesValues.map((el) => {
    const title = typeof el[0] === 'string' ? el[0] : ''
    const money = typeof el[5] === 'number' ? el[5] : 0
    const description = typeof el[6] === 'string' ? el[6] : ''
    return { title, money, description }
  })

  return { currentChanges, currentRemain }
}
