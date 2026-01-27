import type { AppContext } from '@/core'
import cron from 'node-cron'
import { registerDdsNotificationsTask } from './ddsNotifications'
import { registerRemainsTask } from './remains'

export const enum TaskName {
  REMAINS = 'remains',
  DDS_NOTIFICATIONS = 'dds-notifications',
}

export function registerTasks(app: AppContext) {
  registerDdsNotificationsTask(app)
  registerRemainsTask(app)

  // в режиме разработки останавливаем все задачи
  if (process.env.NODE_ENV === 'development') {
    cron.getTasks().forEach(task => task.stop())
  } else {
    // для продакта включаем логирование ошибок в консоль и ТГ
    cron.getTasks().forEach((task) => {
      task.on('execution:failed', (ctx) => {
        app.logger.error(`Ошибка при выполнении задачи ${task.name}: ${ctx.execution.error}`)
      })
    })
  }
}
