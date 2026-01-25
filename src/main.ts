import { registerBots } from './bots'
import { createAppContext } from './core'

(async function main() {
  const app = await createAppContext()

  registerBots(app)
})()
