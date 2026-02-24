import type { AppContext } from '@/core/appContext'
import type { DDsData } from '@/infrastructure/google-sheets'
import fs from 'node:fs/promises'
import path from 'node:path'
import { extractChatId, getCustomerData, getDDSData, getDDSSpreadsheetsData } from '@/infrastructure/google-sheets'

const DEFAULT_DDS_ROW = 7
const PATH_DDS_LAST_STATE = path.resolve('dds-last-state.json')
let rowMap: Record<string, number>

export async function startDdsNotificatorUsecase(app: AppContext) {
  if (!rowMap) {
    rowMap = await readJsonData(PATH_DDS_LAST_STATE) || {}
  }

  const ddss = await getDDSSpreadsheetsData(app.sheets)
  const customers = await getCustomerData(app.sheets)

  try {
    for (const dds of ddss) {
      if (!dds.spreadsheetId)
        continue

      let lastCheckedRow = rowMap[dds.spreadsheetId] || DEFAULT_DDS_ROW

      const { currentChanges: changes } = await getDDSData(
        app.sheets,
        dds.spreadsheetId,
        lastCheckedRow,
      )

      if (!changes.length)
        continue

      const customer = customers.find(c => c.title.toLowerCase().includes(dds.clientName.toLowerCase()))
      if (!customer)
        continue

      const chatId = extractChatId(customer.telegramChatRaw)
      const messages: string[] = []

      for (let i = changes.length - 1; i >= 0; i--) {
        const msg = formatMessage(customer.title, changes[i])
        messages.push(msg)
      }

      for (const msg of messages.reverse()) {
        await app.notification.send(chatId, msg)
        // console.log(`Would send to ${chatId}:\n${msg}\n---`)
        lastCheckedRow++
      }

      rowMap[dds.spreadsheetId] = lastCheckedRow
    }
  } finally {
    await writeJsonData(PATH_DDS_LAST_STATE, rowMap)
  }
}

async function readJsonData(filePath: string) {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    if (!content)
      return
    return JSON.parse(content)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.writeFile(filePath, JSON.stringify({}), { mode: 0o700 })
      return
    }
    throw error
  }
}

async function writeJsonData(filePath: string, rowMap: Record<string, number>) {
  await fs.writeFile(filePath, JSON.stringify(rowMap), { mode: 0o700 })
}

function formatMessage(customer: string, dds: DDsData): string {
  const roundedRemain = Math.round(dds.currentRemain)
  const roundedMoney = Math.round(Math.abs(dds.money))
  const changeType = dds.money > 0 ? 'Пополнение' : 'Расход'
  return `${customer}
${changeType} на ${roundedMoney} руб.
${dds.description}
Текущий баланс ${roundedRemain} руб.`
}
