import type { AppContext } from '@/core'
import cron from 'node-cron'
import { sleep } from '@/shared/utils'
import { processDailyReport } from '@/usecases/daily-report'
import { processElamaRemains } from '@/usecases/elama-remain'
import { TaskName } from '.'

export interface RemainsTaskResult {
  updatedCount: number
  totalTasks: number
  successCount: number
}

export function registerRemainsTask(app: AppContext) {
  return cron.schedule('0 9 * * 1-5', async () => {
    app.logger.info('Запускаем задачу обновления остатков')
    let updatedCount = 0
    let tryCount = 0
    while (tryCount < 3) {
      try {
        updatedCount = await processElamaRemains(app, 'browser', {})
        break
      } catch (e) {
        tryCount++
        app.logger.info(`Произошла ошибка при обновлении остатков. Попытка ${tryCount} из 3`)

        if (tryCount === 3) {
          throw e
        }
      }
    }

    app.logger.info(`Elama remains processed: ${updatedCount} items updated`)

    await sleep(10000) // ждем немного времени чтобы таблица excel успела обновиться наверняка и пересчитать значения

    const { totalTasks, successCount } = await processDailyReport(app)

    app.logger.info(`Daily report processed: ${successCount}/${totalTasks} reports sent`)

    return { updatedCount, totalTasks, successCount } satisfies RemainsTaskResult
  }, { timezone: 'Europe/Moscow', name: TaskName.REMAINS, noOverlap: true })
}
