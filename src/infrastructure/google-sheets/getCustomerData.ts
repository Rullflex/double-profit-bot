import type { sheets_v4 } from 'googleapis'
import { DATA_SPREADSHEET_ID } from './sheets.config'

export interface CustomerData {
  title: string
  gLink: string
  thresholdBalance: number
  telegramChatRaw: string
}

const CUSTOMER_DATA_RANGE = 'TelegramBot!K3:N'

export async function getCustomerData(
  sheets: sheets_v4.Sheets,
): Promise<CustomerData[]> {
  const response = await sheets.spreadsheets.get({
    spreadsheetId: DATA_SPREADSHEET_ID,
    ranges: [CUSTOMER_DATA_RANGE],
    fields: 'sheets(data(rowData(values(hyperlink,formattedValue))))',
  })

  const sheet = response.data.sheets?.[0]
  const dataArray = sheet?.data?.[0]?.rowData || []

  const customerList: CustomerData[] = []

  for (const rowData of dataArray) {
    const values = rowData?.values || []

    if (values.length < 3) {
      throw new Error(`bad value length, row: ${JSON.stringify(values)}`)
    }

    const title = values[0]?.formattedValue
    const gLink = values[1]?.hyperlink || values[1]?.formattedValue
    const threshold = values[2]?.formattedValue
    const chatRaw = values[3]?.formattedValue

    if (!chatRaw) {
      continue
    }

    if (typeof title !== 'string') {
      throw new TypeError(`invalid title type, row: ${JSON.stringify(values)}`)
    }
    if (gLink && typeof gLink !== 'string') {
      throw new TypeError(`invalid gLink type, row: ${JSON.stringify(values)}`)
    }
    if (typeof threshold !== 'number' && typeof threshold !== 'string') {
      throw new TypeError(`invalid thresholdBalance type, row: ${JSON.stringify(values)}`)
    }
    if (typeof chatRaw !== 'string') {
      throw new TypeError(`invalid telegramChatRaw type, row: ${JSON.stringify(values)}`)
    }

    customerList.push({
      title,
      gLink: gLink || '',
      thresholdBalance: typeof threshold === 'string' ? Number(threshold.replace(/\s/g, '')) : threshold,
      telegramChatRaw: chatRaw,
    })
  }

  return customerList
}
