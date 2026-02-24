import type { AppContext } from '@/core'
import cron from 'node-cron'
import { startDdsNotificatorUsecase } from '@/usecases/dds-notificator'
import { TaskName } from '.'

export function registerDdsNotificationsTask(app: AppContext) {
  return cron.schedule('0 8-20 * * 1-5', async () => {
    await startDdsNotificatorUsecase(app)
  }, { timezone: 'Europe/Moscow', name: TaskName.DDS_NOTIFICATIONS, noOverlap: true })
}
