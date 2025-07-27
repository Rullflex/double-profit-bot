# 📦 double-profit-bot

Многофункциональный Telegram-бот, написанный на TypeScript (Node.js), с интеграцией Google Sheets и поддержкой внутренних/внешних ботов.

---

## 🚀 Возможности

- 📬 Команда `/massmessage` — массовая рассылка по выбранным чатам
- 📊 Команда `/dailyreport` — отправка отчётов клиентам
- Команда `/elama` — заполнение таблицы с остатками по HTML-выгрузки с сервиса "Елама"
- 📈 Уведомления по ДДС — автоматическая проверка остатков и оповещение
- ⚙️ Обработка событий в чатах: добавление, удаление, переименование и миграции
- 📗 Интеграция с Google Sheets

---

## 🧱 Структура проекта

```
src/
├── bots/                  # Входные точки для ботов
│   ├── internal/
│   └── external/
├── core/                  # appContext: DI и управление жизненным циклом
├── services/              # Инфраструктурные сервисы (logger, sheets)
├── usecases/              # Бизнес-логика (massMessage, dailyReport, и т.д.)
├── handlers/              # Обработчики событий Telegram
├── infrastructure/        # Инфраструктурный код для сервисов (работа с таблицами GoogleSheets)
├── shared/                # Переиспользуемые части без привязки к бизнес логике
│   ├── utils/             # Вспомогательные функции
│   ├── consts/
│   └── types/
```

---

## 🔧 Используемые технологии

- **TypeScript**
- **Node.js (ESM)**
- **[grammY](https://grammy.dev/)** — Telegram Bot API
- **Google Sheets API**
- **Vitest** — тестирование
- **tsx** — запуск TS-файлов без сборки

---

## 🧪 Тестирование

```bash
npx vitest run
```

- Поддержка моков (`vi.fn()`)
- Интеграционные и unit тесты
- Примеры в `tests/`

---

## 🛡 Авторизация Google Sheets

- Используется `credentials.json` сервисного аккаунта
- Таблицы должны быть расшарены на email аккаунта:
  ```
  my-service-account@your-project.iam.gserviceaccount.com
  ```

---

## 📂 Переменные окружения

`.env`:
```
INTERNAL_BOT_TOKEN=...
EXTERNAL_BOT_TOKEN=...
```

---

## 🧠 Контекст выполнения

Через `AbortController`:
```ts
ctx: {
  signal: AbortSignal;
  cancel: () => void;
}
```

Используется для контроля задач, graceful shutdown, отмены команд.

---

## 📌 Соглашения

- Архитектура разделена по слоям
- Каждая функция изолирована и тестируема
- Именование: `camelCase.ts`, глаголы в названиях

---

## 📄 Лицензия

MIT
