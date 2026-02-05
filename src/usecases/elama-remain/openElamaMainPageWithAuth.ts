import type { Page } from 'puppeteer'
import { Solver } from '@2captcha/captcha-solver'
import axios from 'axios'
import { sleep } from '@/shared/utils'

const EMAIL = process.env.ELAMA_EMAIL!
const PASSWORD = process.env.ELAMA_PASSWORD!
const RUCAPTCHA_API_KEY = process.env.RUCAPTCHA_API_KEY!

export async function openElamaMainPageWithAuth(page: Page) {
  await page.goto('https://new.elama.ru/agency')

  // Ждем 3 секунды и проверяем, произошел ли редирект на страницу авторизации
  await sleep(3000)

  if (page.url().includes('signin')) {
    await fillLoginForm(page, EMAIL, PASSWORD)

    await Promise.any([
      page.waitForNavigation({ timeout: 60000 }),
      (async () => {
        const token = await solveCaptchaIfPresent(page)
        await submitLoginToken(page, token, EMAIL, PASSWORD)
      })(),
    ])
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
    console.warn('⚠️ iFrame с капчей не появился. Возможно, капча не требуется.')
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
