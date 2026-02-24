import type { AppContext } from '@/core'
import fs from 'node:fs/promises'
import path from 'node:path'
import { InputFile } from 'grammy'
import { extractChatId, getCustomerData, getInvoiceData, updateLastInvoiceDate } from '@/infrastructure/google-sheets'
import { withBrowser } from '@/services/puppeteer-service'
import { IS_DEV } from '@/shared/consts'
import { sleep } from '@/shared/utils'
import { clearAllFiltersOnMainPage } from '../elama-remain/clearAllFiltersOnMainPage'
import { openElamaMainPageWithAuth } from '../elama-remain/openElamaMainPageWithAuth'

export async function startElamaInvoiceUsecase(app: AppContext) {
  const rows = await getInvoiceData(app.sheets)
  const customers = await getCustomerData(app.sheets)

  if (!rows.length)
    throw new Error('No invoice data')

  await withBrowser(async ({ page }) => {
    await openElamaMainPageWithAuth(page)

    // Готовоимся к загрузке файла
    const downloadDir = path.resolve(process.cwd(), 'tmp/elama-invoices')
    await fs.mkdir(downloadDir, { recursive: true })

    const client = await page.createCDPSession()
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadDir,
    })

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index]

      if (row && row.clientName && row.elamaId && row.invoiceAmount && row.shouldIssueInvoice === 'ДА' && row.needsCheckReminder === 'НУЖНО') {
        const targetCustomer = customers.find(c => c.title.toLowerCase().includes(row.clientName.toLowerCase()))
        if (!targetCustomer)
          continue

        await clearAllFiltersOnMainPage(page)

        await page.waitForSelector('[data-test="AgencyClientsFilter__TransparentInput"]').then(el => el?.type(String(row.elamaId)))
        await page.keyboard.press('Enter')

        await page.waitForSelector('[data-test="Agency_clientList"] >>> button::-p-text(Выставить счет)', {
          visible: true,
        }).then(el => el?.click())

        const modal = await page.waitForSelector('[data-test="Modal"]', { visible: true })
        await modal.waitForSelector('[data-test="Field.contractId"]', { visible: true }).then(el => el?.click())
        const contractOptions = await modal.waitForSelector('[data-test="Field.contractId__optionList"]', { visible: true })
        await (await contractOptions.$('[data-test="Option"]'))?.click()
        const amountInput = await modal.waitForSelector('[data-test="Field.amount"]', { visible: true })
        await amountInput?.type(String(row.invoiceAmount))

        // Игнорируем в деве опасный блок. По нажатию формируется счет и отправляется на email клиента.
        if (IS_DEV) {
          await updateLastInvoiceDate(app.sheets, index)
          await page.waitForSelector('button::-p-text(Отменить)', { visible: true }).then(el => el?.click())
          continue
        }

        await page.waitForSelector('button[type="submit"]::-p-text(Выставить счет)', { visible: true }).then(el => el?.click())

        // состояние ДО клика
        const filesBefore = new Set(await fs.readdir(downloadDir))

        await page.waitForSelector('button[type="button"]::-p-text(Сохранить .pdf)', { visible: true }).then(el => el?.click())
        // ждём появления нового файла
        let downloadedFile: string | null = null

        for (let i = 0; i < 20; i++) {
          await sleep(500)

          const filesAfter = await fs.readdir(downloadDir)
          const diff = filesAfter.find(f => !filesBefore.has(f))

          if (diff) {
            downloadedFile = diff
            break
          }
        }

        if (!downloadedFile)
          throw new Error('Файл не был скачан')

        const filePath = path.join(downloadDir, downloadedFile)

        try {
          const chatId = extractChatId(targetCustomer.telegramChatRaw)
          await app.notification.sendDocument(chatId, new InputFile(filePath), { caption: '#счета \n\nДобрый день! Высылаю счет на пополнение Еламы' })
        } finally {
          await fs.unlink(filePath)
        }

        await updateLastInvoiceDate(app.sheets, index)

        await page.waitForSelector('button::-p-text(Закрыть)', { visible: true }).then(el => el?.click())

        app.logger.info(`Выставлен счет для ${row.elamaId}`)
        await sleep(1000)
      }
    }
  })
}
