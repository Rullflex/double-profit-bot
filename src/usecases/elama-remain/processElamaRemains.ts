import type { Buffer } from 'node:buffer'
import type { AppContext } from '@/core/appContext'
import { getMoneyRemainData, updateCommonMoneyRemain } from '@/infrastructure/google-sheets'
import { parseElamaRemainsFromBrowser } from './parseElamaRemainsFromBrowser'
import { parseElamaRemainsFromFile } from './parseElamaRemainsFromFile'
import { updateElamaRemains } from './updateElamaRemains'

interface ProcessElamaRemainsOptions {
  buffer?: Buffer
  logProgress?: (message: string) => void
}

export async function processElamaRemains(app: AppContext, type: 'file' | 'browser', { buffer, logProgress }: ProcessElamaRemainsOptions): Promise<number> {
  const parsedElamaRemains = type === 'file' ? parseElamaRemainsFromFile(buffer) : await parseElamaRemainsFromBrowser(logProgress)
  const currentRemains = await getMoneyRemainData(app.sheets)
  const { updatedCount, updatedRemains } = updateElamaRemains(currentRemains, parsedElamaRemains)
  await updateCommonMoneyRemain(app.sheets, updatedRemains)

  return updatedCount
}
