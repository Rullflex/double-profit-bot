import type { Page } from 'puppeteer'
import type { ParsedElamaRemains } from './types'
import { createLogger } from '@/services'
import { withBrowser } from '@/services/puppeteer-service'
import { clearAllFiltersOnMainPage } from './clearAllFiltersOnMainPage'
import { openElamaMainPageWithAuth } from './openElamaMainPageWithAuth'

const logger = createLogger({ label: 'parseElamaRemainsFromBrowser' })

export function parseElamaRemainsFromBrowser(logProgress: (message: string) => void = logger.info) {
  return withBrowser(async ({ page }) => {
    await openElamaMainPageWithAuth(page)

    logProgress('Начинаю процесс парсинга: загружаю страницу, очищаю фильтры и собираю данные')
    await clearAllFiltersOnMainPage(page)
    return await parseElamaRemainsFromPage(page, logProgress)
  })
}

async function parseElamaRemainsFromPage(page: Page, logProgress: (message: string) => void): Promise<ParsedElamaRemains> {
  const result: ParsedElamaRemains = {}
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
