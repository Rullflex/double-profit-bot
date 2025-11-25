import type { sheets_v4 } from 'googleapis'
import { google } from 'googleapis'
import { authorize } from './authorize'

let cachedSheetsClient: sheets_v4.Sheets | null = null

export async function getSheetsClient(): Promise<sheets_v4.Sheets> {
  if (!cachedSheetsClient) {
    const auth = await authorize()
    cachedSheetsClient = google.sheets({ version: 'v4', auth })
  }

  return cachedSheetsClient
}

/**
 * Extracts a Google Sheets document ID from a Google Sheets URL.
 *
 * Given a URL like https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=0,
 * this function returns the value of SPREADSHEET_ID.
 *
 * If the URL does not contain a valid Google Sheets document ID, this function
 * returns an empty string.
 */
export function extractSheetIdFromGLink(link: string): string {
  const match = /\/d\/([^/]+)/.exec(link)
  return match?.[1] || ''
}
