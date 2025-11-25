import type { JWT } from 'google-auth-library'
import fs from 'node:fs'
import { google } from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const CREDENTIALS_PATH = 'credentials.json'

export async function authorize(): Promise<JWT> {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'))

  const client = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: SCOPES,
  })

  await client.authorize()
  return client
}
