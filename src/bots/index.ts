import type { AppContext } from '@/core'
import { registerExternalBot } from './external'
import { registerInternalBot } from './internal'

export function registerBots(app: AppContext) {
  registerInternalBot(app)
  registerExternalBot(app)
}
