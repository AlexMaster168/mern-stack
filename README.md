# EduLink — платформа сокращателя ссылок + LMS

Полнофункциональное веб-приложение на современном MERN-стеке, объединяющее **два равноправных модуля**:

- 🔗 **Сокращатель ссылок 2.0** — кастомные алиасы, QR-коды, срок жизни / лимит переходов / пароль, командная работа (workspaces с ролями) и аналитика кликов.
- 🎓 **LMS (система обучения)** — курсы с богатым контентом (текст, изображения, графики), модули и уроки, запись на курс и прогресс, квизы с проверкой на сервере, сертификаты с публичной верификацией и комментарии (только для записанных).

Проект изначально был учебным сокращателем ссылок и был значительно расширен и переведён на актуальные версии технологий.

---

## Содержание

- [Возможности](#возможности)
- [Скриншоты](#скриншоты)
- [Технологии](#технологии)
- [Архитектура](#архитектура)
- [Схема базы данных](#схема-базы-данных)
- [Быстрый старт](#быстрый-старт)
- [Переменные окружения](#переменные-окружения)
- [Скрипты](#скрипты)
- [Тесты](#тесты)
- [Структура проекта](#структура-проекта)
- [Обзор API](#обзор-api)

---

## Возможности

### 🔗 Сокращатель ссылок

- **Кастомные алиасы** — свой короткий код (`/t/my-promo`) с проверкой уникальности и зарезервированных слов.
- **QR-коды** — генерация и скачивание PNG для любой ссылки.
- **Ограничения**: срок действия, лимит переходов, пароль на ссылку. Истёкшие/исчерпанные/отключённые ссылки ведут на страницу «недоступно»; защищённые паролем — на страницу разблокировки.
- **Команды (workspaces)** с ролями `owner / editor / viewer`: общие ссылки, приглашение участников по email, управление ролями.
- **Аналитика кликов**: переходы по дням, разбивка по устройствам, браузерам и источникам (графики на recharts). Парсинг User-Agent без хранения IP.

### 🎓 LMS

- **Курсы** с обложкой, галереей и контент-блоками (текст / изображения / **графики** bar·line·pie).
- **Модули и уроки**, запись на курс, отметка пройденных уроков и прогресс.
- **Квизы**: оценивание **только на сервере**, правильные ответы не утекают студенту, порог прохождения 60%.
- **Сертификаты**: выдаются после завершения курса, публичная верификация по ID.
- **Комментарии**: писать могут только записанные на курс / прошедшие его.

### 🔐 Авторизация

- Схема **access + refresh** токенов: короткоживущий access-JWT (15 мин) + ротируемый refresh-токен (7 дней, httpOnly-cookie, в БД хранится только SHA-256 хеш).
- Роли пользователей: `admin / instructor / student`. Защищённые и ролевые маршруты на фронте.

---

## Скриншоты

### 🎓 LMS — глазами студента

| Каталог курсов | Страница курса: прогресс, галерея, графики, отзывы |
| --- | --- |
| ![Каталог курсов](docs/screenshots/catalog.png) | ![Страница курса](docs/screenshots/course-student.png) |

| Урок: контент-блоки и графики | Квиз с проверкой на сервере |
| --- | --- |
| ![Урок](docs/screenshots/lesson.png) | ![Квиз](docs/screenshots/quiz.png) |

| Мои курсы и прогресс | Мои сертификаты |
| --- | --- |
| ![Мои курсы](docs/screenshots/my-courses.png) | ![Мои сертификаты](docs/screenshots/certificates.png) |

Публичная верификация сертификата по ID:

![Верификация сертификата](docs/screenshots/certificate-verify.png)

### 🎓 LMS — глазами преподавателя

| Список своих курсов | Редактор курса: текст, картинки, графики, модули, уроки, квизы |
| --- | --- |
| ![Преподавание](docs/screenshots/teach.png) | ![Редактор курса](docs/screenshots/course-editor.png) |

### 🔗 Сокращатель ссылок

| Создание ссылки: алиас, срок, лимит, пароль | Мои ссылки |
| --- | --- |
| ![Создание ссылки](docs/screenshots/create.png) | ![Мои ссылки](docs/screenshots/links.png) |

| Аналитика ссылки: QR + графики кликов | Разблокировка по паролю |
| --- | --- |
| ![Аналитика ссылки](docs/screenshots/link-analytics.png) | ![Разблокировка](docs/screenshots/link-unlock.png) |

| Ссылка недоступна (срок/лимит/отключена) | Регистрация / вход |
| --- | --- |
| ![Недоступна](docs/screenshots/link-unavailable.png) | ![Регистрация](docs/screenshots/auth-register.png) |

### 👥 Команды (workspaces)

Общие ссылки, участники и роли (`owner / editor / viewer`):

![Команда и роли](docs/screenshots/workspace.png)

---

## Технологии

| Слой | Стек |
| --- | --- |
| **Backend** | Node.js 22, TypeScript (ESM, NodeNext), Fastify 5, Mongoose 8, MongoDB, zod 4, @fastify/jwt · cookie · cors · helmet · rate-limit · multipart · static, bcryptjs, pino, ua-parser-js |
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 7, TanStack Query 5, axios, recharts 3, qrcode.react |
| **Тесты** | Vitest, `app.inject()` (Fastify), mongodb-memory-server |
| **Инфра** | pnpm workspaces (монорепо), Docker (multi-stage) + docker-compose, GitHub Actions CI |

---

## Архитектура

- **Монорепо** на pnpm workspaces: пакеты `server` и `client`.
- **Бэкенд — слоистый**: `routes → controllers → services → models`, валидация через zod-схемы, единый обработчик ошибок, доменные ошибки `ApiError`.
- **Фронтенд — feature-based**: каждая фича (`auth`, `links`, `workspaces`, `courses`) держит свои `api / hooks / components / pages`.
- **Dev**: Vite-прокси делает фронт и API same-origin (`/api`, `/t/`, `/uploads` → бэкенд), поэтому httpOnly refresh-cookie работает без https.
- **Prod**: один образ — Fastify отдаёт и API, и собранный SPA (SPA-fallback на `index.html`).

---

## Схема базы данных

MongoDB, 14 коллекций. Модуль ссылок: `User · Link · Workspace · Membership · ClickEvent`. Модуль LMS: `Course · Module · Lesson · Enrollment · Comment · Quiz · QuizAttempt · Certificate`. Авторизация: `RefreshToken`. Ниже — полная ER-схема: все поля с типами, ключи (`PK / unique / FK →`) и связи между коллекциями.

![Схема базы данных EduLink](docs/db-schema.png)

> Картинка большая (4800×2800) — кликните для просмотра всех полей в деталях. Нарисовано в Excalidraw; редактируемый исходник — [`docs/db-schema.excalidraw`](docs/db-schema.excalidraw) (открывается на excalidraw.com или в десктоп-приложении).

---

## Быстрый старт

### Вариант 1 — Docker (рекомендуется)

Нужен только Docker. Поднимает MongoDB и приложение одной командой:

```bash
# (опционально) задайте свой секрет
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env

docker compose up --build
```

Откройте **http://localhost:5000** — фронт и API на одном порту.

### Вариант 2 — локально

Требуется Node.js ≥ 20, pnpm и строка подключения MongoDB (Atlas или локальная).

```bash
pnpm install

# настроить окружение бэкенда
cp server/.env.example server/.env
#  → впишите MONGO_URI и JWT_SECRET

# (опционально) наполнить демо-данными: курс с графиками + преподаватель
pnpm seed

# запустить фронт и бэк одной командой
pnpm dev
```

- Фронтенд: http://localhost:5173
- Бэкенд: http://localhost:5000

> После `pnpm seed` доступен преподаватель `instructor@edulink.dev` / `instructor123`.

---

## Переменные окружения

Бэкенд (`server/.env`, см. `server/.env.example`):

| Переменная | Назначение | По умолчанию |
| --- | --- | --- |
| `NODE_ENV` | `development` / `production` / `test` | `development` |
| `PORT` | порт бэкенда | `5000` |
| `MONGO_URI` | строка подключения MongoDB | — (обязательна) |
| `JWT_SECRET` | секрет подписи JWT (≥ 16 символов) | — (обязателен) |
| `JWT_ACCESS_TTL_MIN` | время жизни access-токена, минуты | `15` |
| `REFRESH_TTL_DAYS` | время жизни refresh-токена, дни | `7` |
| `APP_BASE_URL` | базовый URL бэкенда (для коротких ссылок) | `http://localhost:5000` |
| `CLIENT_URL` | URL фронтенда (CORS + редиректы ссылок) | `http://localhost:5173` |
| `CLIENT_DIST_DIR` | путь к собранному SPA (prod) | `../../client/dist` |
| `DNS_SERVERS` | переопределение DNS (через запятую), если системный не резолвит SRV Atlas | — |

> ⚠️ `.env` хранит секреты и в git **не коммитится** (`.gitignore`). Используйте свой `JWT_SECRET`.

---

## Скрипты

Запускаются из корня репозитория:

| Команда | Действие |
| --- | --- |
| `pnpm dev` | фронт + бэк параллельно (concurrently) |
| `pnpm build` | сборка бэка (tsc) и фронта (vite) |
| `pnpm start` | запуск собранного бэкенда |
| `pnpm typecheck` | проверка типов в обоих пакетах |
| `pnpm test` | тесты бэкенда (Vitest) |
| `pnpm seed` | наполнить БД демо-данными |

---

## Тесты

```bash
pnpm test
```

Тесты бьют по реальному Fastify-приложению через `app.inject()` поверх in-memory MongoDB (`mongodb-memory-server`). Покрыты: авторизация, ссылки 2.0 (алиасы, срок/лимит/пароль, аналитика), команды и роли, курсы, квизы и сертификаты.

CI (GitHub Actions, `.github/workflows/ci.yml`) на каждый push/PR прогоняет typecheck → тесты → сборку.

---

## Структура проекта

```
mern-stack/
├── server/                      # Бэкенд (Fastify + Mongoose)
│   └── src/
│       ├── config/              # env (zod), подключение к БД
│       ├── models/              # Mongoose-схемы
│       ├── services/            # бизнес-логика
│       ├── controllers/         # обработчики маршрутов
│       ├── routes/              # описание маршрутов + схемы
│       ├── validators/          # zod-схемы запросов
│       ├── plugins/             # auth, error handler, раздача SPA
│       └── utils/               # ApiError, logger, UA-парсер
├── client/                      # Фронтенд (React + Vite)
│   └── src/
│       ├── features/            # auth · links · workspaces · courses
│       ├── components/          # Layout, Navbar, защищённые роуты
│       └── lib/                 # axios-инстанс, queryClient
├── Dockerfile                   # multi-stage сборка
├── docker-compose.yml           # mongo + app
└── pnpm-workspace.yaml
```

---

## Обзор API

Базовый префикс — `/api` (короткие ссылки — `/t`).

**Auth** — `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`

**Ссылки** — `POST /link/generate`, `GET /link`, `GET /link/:id`, `GET /link/:id/stats`, `PATCH /link/:id`, `DELETE /link/:id`, `POST /link/unlock/:code` · редирект `GET /t/:code`

**Команды** — `POST /workspaces`, `GET /workspaces`, `GET·PATCH·DELETE /workspaces/:id`, `GET /workspaces/:id/links`, `POST·PATCH·DELETE /workspaces/:id/members[/:userId]`

**Курсы / LMS** — `GET·POST /courses`, `GET·PATCH·DELETE /courses/:id`, запись и прогресс, квизы, сертификаты, комментарии, загрузка изображений

---

Сделано как портфолио-проект: чистый типобезопасный код, слоистая архитектура, тесты и контейнеризация.
