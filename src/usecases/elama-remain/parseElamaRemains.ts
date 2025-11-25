import type { Buffer } from 'node:buffer'
import type { ElamaCustomer } from './types'

export function parseElamaRemains(buffer: Buffer): Record<number, ElamaCustomer> {
  const result: Record<number, ElamaCustomer> = {}
  const str = buffer.toString()
  const startIdx = str.indexOf('data-test="Agency_clientList"')
  if (startIdx === -1)
    return result
  const endIdx = str.indexOf('ClientsListstyled__PaginationContainer', startIdx)
  if (endIdx === -1)
    return result
  const section = str.slice(startIdx, endIdx)

  const idRegex = /data-test="Agency_clientId"[^>]*>(\d+)</g
  const balanceRegex = /data-test="Agency_clientBalance"[^>]*>([^<₽]+)₽/g

  // Extract all elamaIds
  const elamaIds: number[] = []
  let m
  // eslint-disable-next-line no-cond-assign
  while ((m = idRegex.exec(section)) !== null) {
    elamaIds.push(Number(m[1]))
  }
  // Extract all remains
  const remains: number[] = []
  // eslint-disable-next-line no-cond-assign
  while ((m = balanceRegex.exec(section)) !== null) {
    const remainStr = m[1].replace(/&nbsp;/g, '').replace(/,/g, '.').trim()
    const remain = Number.parseFloat(remainStr)
    remains.push(remain)
  }
  // Match elamaId and remain by order
  const len = Math.min(elamaIds.length, remains.length)
  for (let i = 0; i < len; ++i) {
    result[elamaIds[i]] = { elamaId: elamaIds[i], remain: remains[i] }
  }
  return result
}
