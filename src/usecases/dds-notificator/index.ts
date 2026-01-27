import type { AppContext } from '@/core/appContext'
import type { DDsData } from '@/infrastructure/google-sheets'
import fs from 'node:fs/promises'
import path from 'node:path'
import { extractChatId, getCustomerData, getDDSData } from '@/infrastructure/google-sheets'
import { extractSheetIdFromGLink } from '@/services/google-sheets-service'

const DEFAULT_DDS_ROW = 7
const PATH_DDS_LAST_STATE = path.join(import.meta.dirname, 'dds-last-state.json')
let rowMap: Record<string, number>

export async function startDdsNotificatorUsecase(app: AppContext) {
  if (!rowMap) {
    rowMap = await readJsonData(PATH_DDS_LAST_STATE) || {}
  }

  const customers = await getCustomerData(app.sheets)

  for (const customer of customers) {
    const sheetId = extractSheetIdFromGLink(customer.gLink)

    if (!sheetId)
      continue

    let lastCheckedRow = rowMap[sheetId] || DEFAULT_DDS_ROW

    const { currentChanges: changes, currentRemain: lastRemain } = await getDDSData(
      app.sheets,
      sheetId,
      lastCheckedRow,
    )

    if (!changes.length)
      continue

    const chatId = extractChatId(customer.telegramChatRaw)
    const messages: string[] = []

    let remain = lastRemain
    for (let i = changes.length - 1; i >= 0; i--) {
      const msg = formatMessage(customer.title, changes[i], remain)
      messages.push(msg)
      remain -= changes[i].money
    }

    for (const msg of messages.reverse()) {
      await app.notification.send(chatId, msg)
      lastCheckedRow++
    }

    rowMap[sheetId] = lastCheckedRow
  }

  await writeJsonData(PATH_DDS_LAST_STATE, rowMap)
}

async function readJsonData(filePath: string) {
  const content = await fs.readFile(filePath, 'utf-8')
  if (!content)
    return
  return JSON.parse(content)
}

async function writeJsonData(filePath: string, rowMap: Record<string, number>) {
  await fs.writeFile(filePath, JSON.stringify(rowMap), { mode: 0o700 })
}

function formatMessage(customer: string, dds: DDsData, remain: number): string {
  const roundedRemain = Math.round(remain)
  const roundedMoney = Math.round(Math.abs(dds.money))
  const changeType = dds.money > 0 ? 'Пополнение' : 'Расход'
  return `${customer}
${changeType} на ${roundedMoney}р. ${dds.description}
Свободный остаток ${roundedRemain}р.`
}
