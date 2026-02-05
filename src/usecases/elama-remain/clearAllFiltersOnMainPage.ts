import type { Page } from 'puppeteer'
import { sleep } from '@/shared/utils'

export async function clearAllFiltersOnMainPage(page: Page) {
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
