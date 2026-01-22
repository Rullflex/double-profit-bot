import type { ParsedElamaRemains } from './types'
import type { MoneyRemainData } from '@/infrastructure/google-sheets'

export function updateRemains(currentRemains: MoneyRemainData[], parsedRemains: ParsedElamaRemains) {
  let updatedCount = 0

  for (const current of currentRemains) {
    const parsed = parsedRemains[current.elamaId]
    if (parsed) {
      current.elamaRemain = parsed.remain
      updatedCount++
    }
  }

  return { updatedCount, updatedRemains: currentRemains }
}
