import { registerBots } from './bots'
import { createAppContext } from './core'
import { registerTasks } from './tasks'

(async function main() {
  const app = await createAppContext()

  registerTasks(app)

  registerBots(app)
})()
