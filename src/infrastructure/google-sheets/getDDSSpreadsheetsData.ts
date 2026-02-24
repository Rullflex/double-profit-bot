import type { sheets_v4 } from 'googleapis'
import { extractSheetIdFromGLink } from '@/services/google-sheets-service'
import { MONEY_REMAIN_FIRST_ROW, MONEY_SPREADSHEET_ID } from './sheets.config'

export interface DDsSpreadsheetData {
  clientName: string
  spreadsheetUrl: string
  spreadsheetId: string
}

export async function getDDSSpreadsheetsData(
  sheets: sheets_v4.Sheets,
): Promise<DDsSpreadsheetData[] | null> {
  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: MONEY_SPREADSHEET_ID,
    ranges: [
      `Остатки!C${MONEY_REMAIN_FIRST_ROW}:C`,
      `Остатки!AB${MONEY_REMAIN_FIRST_ROW}:AB`,
    ],
    valueRenderOption: 'UNFORMATTED_VALUE',
  })

  const [clientNamesResponse, urlsResponse] = response.data.valueRanges || []

  if (!clientNamesResponse?.values?.length || !urlsResponse?.values?.length) {
    return null
  }

  const clientNames = clientNamesResponse.values.map(row => row[0])
  const urls = urlsResponse.values.map(row => row[0])

  const minLength = Math.min(clientNames.length, urls.length)

  return Array.from({ length: minLength }).map<DDsSpreadsheetData>((_, index) => {
    const spreadsheetUrl = urls[index] || ''
    const spreadsheetId = extractSheetIdFromGLink(spreadsheetUrl)

    return {
      clientName: clientNames[index],
      spreadsheetUrl,
      spreadsheetId,
    }
  })
}
