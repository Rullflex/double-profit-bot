import type { sheets_v4 } from 'googleapis'
import { MONEY_REMAIN_FIRST_ROW, MONEY_SPREADSHEET_ID } from './sheets.config'

export interface InvoiceData {
  status: 'ПАУЗА' | 'Активен'
  clientName: string
  elamaId: number | null
  invoiceAmount: number | null
  shouldIssueInvoice: 'ДА' | 'НЕТ'
  needsCheckReminder: 'НУЖНО' | 'НЕ НУЖНО'
}

// type InvoiceData = [status: 'ПАУЗА' | 'Активен', nonExpiringAmount: number | '', invoiceAmount: number | '', shouldIssueInvoice: 'ДА' | 'НЕТ', lastInvoiceDate: number | '', needsCheckReminder: 'НУЖНО' | 'НЕ НУЖНО']

export async function getInvoiceData(
  sheets: sheets_v4.Sheets,
): Promise<InvoiceData[] | null> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: MONEY_SPREADSHEET_ID,
    range: `Остатки!B${MONEY_REMAIN_FIRST_ROW}:M`,
    valueRenderOption: 'UNFORMATTED_VALUE',
  })

  if (!response.data.values?.length) {
    return null
  }

  return response.data.values.map<InvoiceData | null>((row) => {
    if (row.length < 9) {
      return null
    }

    const [status, clientName, _manager, elamaId, _ipRemain, _elamaRemain, _, _nonExpiringAmount, invoiceAmount, shouldIssueInvoice, _lastInvoiceDate, needsCheckReminder] = row

    return {
      status,
      clientName,
      elamaId: typeof elamaId === 'number' ? elamaId : null,
      invoiceAmount: typeof invoiceAmount === 'number' ? invoiceAmount : null,
      shouldIssueInvoice,
      needsCheckReminder,
    }
  })
}

export async function updateLastInvoiceDate(
  sheets: sheets_v4.Sheets,
  rowIndex: number,
) {
  const cellIndex = rowIndex + MONEY_REMAIN_FIRST_ROW
  const updateTimeRange: sheets_v4.Schema$ValueRange = {
    range: `Остатки!L${cellIndex}:L${cellIndex}`,
    values: [[getCurrentFormattedDate()]],
  }

  const request: sheets_v4.Schema$BatchUpdateValuesRequest = {
    data: [updateTimeRange],
    valueInputOption: 'USER_ENTERED',
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: MONEY_SPREADSHEET_ID,
    requestBody: request,
  })
}

/*
 * Возвращает текущую дату в формате dd.MM.yyyy
 */
function getCurrentFormattedDate() {
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}`
}
