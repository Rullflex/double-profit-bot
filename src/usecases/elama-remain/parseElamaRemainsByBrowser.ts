import { sleep } from '@/shared/utils';
import type { ElamaCustomer } from "./types";
import { Solver } from '@2captcha/captcha-solver'
import axios from 'axios';
import puppeteer, { type Page } from "puppeteer";
import { createLogger } from "@/services";

const EMAIL = process.env.ELAMA_EMAIL!;
const PASSWORD = process.env.ELAMA_PASSWORD!;
const RUCAPTCHA_API_KEY = process.env.RUCAPTCHA_API_KEY!

const logger = createLogger({ label: "parseElamaRemainsFromPage" });

export async function parseElamaRemainsByBrowser() {
  logger.debug("🔍 Начинаем парсинг остатков Elama");
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  const solver = new Solver(RUCAPTCHA_API_KEY);

  await page.goto("https://account.elama.global/signin");

  await fillLoginForm(page, EMAIL, PASSWORD);
  const token = await solveCaptchaIfPresent(page, solver);
  await submitLoginToken(page, token, EMAIL, PASSWORD);

  const result = await parseElamaRemainsFromPage(page);

  await browser.close();

  return result;
}

async function fillLoginForm(page: Page, email: string, password: string) {
  await page.waitForSelector('[data-test="Field.login"]', { timeout: 15000 });
  await page.type('[data-test="Field.login"]', email);
  await page.click('[data-test="ButtonSignInNext"]');

  await page.waitForSelector('[data-test="Field.password"]', { timeout: 30000 });
  await page.type('[data-test="Field.password"]', password);

  await page.click('[data-test="ButtonSignInSubmit"]');
}

async function solveCaptchaIfPresent(page: Page, solver: Solver): Promise<string | null> {
  const iframeAppeared = await page.waitForFunction(() => {
    return [...document.querySelectorAll('iframe')].some(iframe => iframe.src.includes("smartcaptcha.yandexcloud.net"));
  }, { timeout: 30000 }).catch(() => null);

  if (!iframeAppeared) {
    logger.warn("⚠️ iFrame с капчей не появился. Возможно, капча не требуется.");
    return null;
  }

  const captchaFrame = page.frames().find(frame => frame.url().includes("smartcaptcha.yandexcloud.net"));
  if (!captchaFrame) throw new Error("⚠️ Не удалось найти iframe с капчей");

  const iframeUrl = captchaFrame.url();
  const sitekeyMatch = iframeUrl.match(/key=([a-zA-Z0-9_-]+)/);
  const sitekey = sitekeyMatch?.[1];
  if (!sitekey) throw new Error("Не удалось извлечь sitekey из iframe URL");

  const res = await solver.yandexSmart({
    sitekey,
    pageurl: page.url(),
  });

  return res.data;
}

async function submitLoginToken(page: Page, token: string | null, email: string, password: string) {
  const signinRes = await axios.post<{ backUrl: string, userId: number }>("https://account.elama.global/api/v2/signin", {
    backUrl: "",
    formId: "",
    login: email,
    password,
    "g-recaptcha-response": token,
    sourceUrl: "https://elama.ru/?formId=homepage&X-Alt-Auth-Refresh=1",
  }, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!signinRes.data.backUrl) throw new Error("⚠️ Не получен backUrl из ответа Elama");

  await page.goto(signinRes.data.backUrl);
  await page.waitForNavigation({ timeout: 30000 });
}

async function parseElamaRemainsFromPage(page: Page): Promise<Record<number, ElamaCustomer>> {
  logger.debug("🔍 Начинаем парсинг остатков Elama");

  const result: Record<number, ElamaCustomer> = {};

  const sectionHandle = await page.waitForSelector('[data-test="Agency_clientList"]', { timeout: 30000 });
  logger.debug("🔍 Селектор Agency_clientList найден, начинаем парсинг");

  let pageIndex = 1;
  while (true) {
    logger.debug(`📄 Парсим страницу ${pageIndex}`);

    const sectionHtml = await page.evaluate(
      (start) => {
        const range = document.createRange();
        range.setStartBefore(start);
        range.setEndAfter(start);
        const div = document.createElement("div");
        div.appendChild(range.cloneContents());
        return div.innerHTML;
      },
      sectionHandle
    );

    const idRegex = /data-test="Agency_clientId"[^>]*>(\d+)</g;
    const balanceRegex = /data-test="Agency_clientBalance"[^>]*>([^<₽]+)₽/g;

    const elamaIds: number[] = [];
    let match: RegExpExecArray | null;
    while ((match = idRegex.exec(sectionHtml)) !== null) {
      elamaIds.push(Number(match[1]));
    }

    const remains: number[] = [];
    while ((match = balanceRegex.exec(sectionHtml)) !== null) {
      let remainStr = match[1].replace(/&nbsp;/g, '').replace(/,/g, '.').trim();
      remains.push(parseFloat(remainStr));
    }

    const len = Math.min(elamaIds.length, remains.length);
    for (let i = 0; i < len; ++i) {
      result[elamaIds[i]] = { elamaId: elamaIds[i], remain: remains[i] };
    }

    logger.debug(`✅ Страница ${pageIndex} обработана: ${len} записей`);

    // Проверяем, можно ли перейти на следующую страницу
    const nextButton = await page.$('button[value="nextPage"]');
    if (!nextButton) {
      logger.debug("⛔ Кнопка nextPage не найдена, завершаем");
      break;
    }

    const isDisabled = await nextButton.evaluate(btn => btn.hasAttribute("disabled"));
    if (isDisabled) {
      logger.debug("⛔ Достигнута последняя страница");
      break;
    }

    await nextButton.click();
    await sleep(1500); // ожидание обновления страницы
    pageIndex++;
  }

  logger.debug(`🎯 Итог: собрано ${Object.keys(result).length} записей`);
  return result;
}