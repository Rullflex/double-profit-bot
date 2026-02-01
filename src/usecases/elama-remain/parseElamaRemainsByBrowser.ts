import type { Page } from 'puppeteer'
import type { ElamaCustomer } from './types'
import { Solver } from '@2captcha/captcha-solver'
import axios from 'axios'
import puppeteer from 'puppeteer'
import { createLogger } from '@/services'
import { sleep } from '@/shared/utils'

const EMAIL = process.env.ELAMA_EMAIL!
const PASSWORD = process.env.ELAMA_PASSWORD!
const RUCAPTCHA_API_KEY = process.env.RUCAPTCHA_API_KEY!

const logger = createLogger({ label: 'parseElamaRemainsFromPage' })

export async function parseElamaRemainsByBrowser(logProgress: (message: string) => void = logger.info) {
  const browser = await puppeteer.launch({
    userDataDir: './user_data',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  })

  try {
    const page = await browser.newPage()
    await page.goto('https://new.elama.ru/agency')

    // Ждем 3 секунды и проверяем, произошел ли редирект на страницу авторизации
    await sleep(3000)

    if (page.url().includes('signin')) {
      logProgress('Прохожу авторизацию на сайте Elama')
      await fillLoginForm(page, EMAIL, PASSWORD)

      await Promise.any([
        page.waitForNavigation({ timeout: 60000 }),
        (async () => {
          const token = await solveCaptchaIfPresent(page)
          await submitLoginToken(page, token, EMAIL, PASSWORD)
        })(),
      ])
    }

    logProgress('Начинаю процесс парсинга: загружаю страницу, очищаю фильтры и собираю данные')
    return await parseElamaRemainsFromPage(page, logProgress)
  } finally {
    await browser.close()
  }
}

async function fillLoginForm(page: Page, email: string, password: string) {
  await page.waitForSelector('[data-test="Field.login"]')
  await page.type('[data-test="Field.login"]', email)
  await page.click('[data-test="ButtonSignInNext"]')

  await page.waitForSelector('[data-test="Field.password"]')
  await page.type('[data-test="Field.password"]', password)

  await page.click('[data-test="ButtonSignInSubmit"]')
}

async function solveCaptchaIfPresent(page: Page): Promise<string | null> {
  const solver = new Solver(RUCAPTCHA_API_KEY)
  const iframeAppeared = await page.waitForFunction(() => {
    return [...document.querySelectorAll('iframe')].some(iframe => iframe.src.includes('smartcaptcha.yandexcloud.net'))
  }, { timeout: 30000 }).catch(() => null)

  if (!iframeAppeared) {
    logger.warn('⚠️ iFrame с капчей не появился. Возможно, капча не требуется.')
    return null
  }

  const captchaFrame = page.frames().find(frame => frame.url().includes('smartcaptcha.yandexcloud.net'))
  if (!captchaFrame)
    throw new Error('⚠️ Не удалось найти iframe с капчей')

  const iframeUrl = captchaFrame.url()
  const sitekeyMatch = iframeUrl.match(/key=([\w-]+)/)
  const sitekey = sitekeyMatch?.[1]
  if (!sitekey)
    throw new Error('Не удалось извлечь sitekey из iframe URL')

  const res = await solver.yandexSmart({
    sitekey,
    pageurl: page.url(),
  })

  return res.data
}

async function submitLoginToken(page: Page, token: string | null, email: string, password: string) {
  const signinRes = await axios.post<{ backUrl: string, userId: number }>('https://account.elama.global/api/v2/signin', {
    'backUrl': '',
    'formId': '',
    'login': email,
    password,
    'g-recaptcha-response': token,
    'sourceUrl': 'https://elama.ru/?formId=homepage&X-Alt-Auth-Refresh=1',
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!signinRes.data.backUrl)
    throw new Error('⚠️ Не получен backUrl из ответа Elama')

  await page.goto(signinRes.data.backUrl)
  await page.waitForNavigation({ timeout: 60000 })
}

async function parseElamaRemainsFromPage(page: Page, logProgress: (message: string) => void): Promise<Record<number, ElamaCustomer>> {
  await clearAllTags(page)

  const result: Record<number, ElamaCustomer> = {}
  const sectionHandle = await page.waitForSelector('[data-test="Agency_clientList"]', { timeout: 60000 })

  let pageIndex = 1
  while (true) {
    const sectionHtml = await page.evaluate(
      (start) => {
        const range = document.createRange()
        range.setStartBefore(start)
        range.setEndAfter(start)
        const div = document.createElement('div')
        div.appendChild(range.cloneContents())
        return div.innerHTML
      },
      sectionHandle,
    )

    const idRegex = /data-test="Agency_clientId"[^>]*>(\d+)</g
    const balanceRegex = /data-test="Agency_clientBalance"[^>]*>([^<₽]+)₽/g

    const elamaIds: number[] = []
    let match: RegExpExecArray | null
    // eslint-disable-next-line no-cond-assign
    while ((match = idRegex.exec(sectionHtml)) !== null) {
      elamaIds.push(Number(match[1]))
    }

    const remains: number[] = []
    // eslint-disable-next-line no-cond-assign
    while ((match = balanceRegex.exec(sectionHtml)) !== null) {
      const remainStr = match[1].replace(/&nbsp;/g, '').replace(/,/g, '.').trim()
      remains.push(Number.parseFloat(remainStr))
    }

    const len = Math.min(elamaIds.length, remains.length)
    for (let i = 0; i < len; ++i) {
      result[elamaIds[i]] = { elamaId: elamaIds[i], remain: remains[i] }
    }

    logProgress(`✅ Страница ${pageIndex} обработана: ${len} записей`)

    // Проверяем, можно ли перейти на следующую страницу
    const nextButton = await page.$('button[value="nextPage"]')
    if (!nextButton) {
      logger.debug('⛔ Кнопка nextPage не найдена, завершаем')
      break
    }

    const isDisabled = await nextButton.evaluate(btn => btn.hasAttribute('disabled'))
    if (isDisabled) {
      logger.debug('⛔ Достигнута последняя страница')
      break
    }

    const currentContent = await sectionHandle.evaluate(el => el.innerHTML)
    await nextButton.click()

    await page.waitForFunction(
      (selector, oldContent) => {
        const section = document.querySelector(selector)
        return section && section.innerHTML !== oldContent
      },
      {},
      '[data-test="Agency_clientList"]',
      currentContent,
    )

    pageIndex++
  }

  logProgress(`🎯 Итог: собрано ${Object.keys(result).length} записей`)
  return result
}

async function clearAllTags(page: Page) {
  const filter = await page.waitForSelector('[data-test="AgencyClientsFilter"]')
  const clearButton = await filter.$('button[data-test="AgencyClientsFilter__ClearButton"]')
  await clearButton?.click()
  await sleep(300)

  const tagFilter = await filter.$('div[type="filter"]')
  if (tagFilter) {
    const hasAllText = await tagFilter.evaluate((el) => {
      return el.textContent?.includes('Все') || false
    })

    if (!hasAllText) {
      await tagFilter.click()
      await sleep(400)
      const popover = await filter.waitForSelector('[data-test="MultiSelectList"]', { visible: true })
      await (await popover.$('label')).click()
      await sleep(300)
      const buttons = await popover.$$('button[type="button"]')
      const applyButton = buttons[buttons.length - 1]
      await applyButton.click()
      await sleep(300)
    }
  }
}
