import type { Browser, Page } from 'puppeteer'
import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer'
import { IS_DEV } from '@/shared/consts'

const IDLE_TIMEOUT_MS = 2 * 60 * 1000 // 2 минуты
const SCREENSHOT_DIR = path.resolve('logs/screenshots')

let browserPromise: Promise<Browser> | null = null
let activePages = 0
let idleTimer: NodeJS.Timeout | null = null

export async function withBrowser<T>(
  fn: (ctx: { browser: Browser, page: Page }) => Promise<T>,
): Promise<T> {
  const browser = await getBrowser()
  const page = await browser.newPage()
  activePages++
  idleTimer && clearTimeout(idleTimer)

  try {
    return await fn({ browser, page })
  } catch (error) {
    if (page && !page.isClosed() && !IS_DEV) {
      ensureScreenshotDir()

      const filePath = path.join(
        SCREENSHOT_DIR,
        `error-${Date.now()}.png`,
      )

      await page.screenshot({
        path: filePath,
        fullPage: true,
      })
    }

    throw error
  } finally {
    activePages--
    await page.close()

    if (activePages === 0)
      scheduleIdleClose()
  }
}

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      userDataDir: './user_data',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: !IS_DEV,
      defaultViewport: { width: 1920, height: 1080 },
    }).catch((err) => {
      browserPromise = null
      throw err
    })
  }

  return browserPromise
}

function scheduleIdleClose() {
  if (idleTimer)
    clearTimeout(idleTimer)

  idleTimer = setTimeout(async () => {
    if (activePages === 0 && browserPromise) {
      const browser = await browserPromise
      await browser.close()
      browserPromise = null
    }
  }, IDLE_TIMEOUT_MS)
}

function ensureScreenshotDir() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  }
}
