import type { AppContext } from '@/core'
import cron from 'node-cron'
import { IS_DEV } from '@/shared/consts'
import { registerDdsNotificationsTask } from './ddsNotifications'
import { registerRemainsTask } from './remains'

export const enum TaskName {
  REMAINS = 'remains',
  DDS_NOTIFICATIONS = 'dds-notifications',
}

export function registerTasks(app: AppContext) {
  registerDdsNotificationsTask(app)
  const remainsTask = registerRemainsTask(app)

  // NOTE останавливаем задачу обновления остатков, пока будем команды вручную запускать. После того как удостоверимся что все стабильно работает - запустим
  remainsTask.stop()

  // в режиме разработки останавливаем все задачи
  if (IS_DEV) {
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
