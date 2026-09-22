# PizzaGo

[English](README.md) | **Русский**

[![CI](https://github.com/Kupy4a/PizzaGo/actions/workflows/ci.yml/badge.svg)](https://github.com/Kupy4a/PizzaGo/actions/workflows/ci.yml)

Интернет-магазин доставки пиццы: меню по категориям, корзина, оформление заказа, личный кабинет с историей заказов и панель администратора для управления заказами. Интерфейс доступен на английском и русском.

![Главная страница](docs/ru/home.png)

## Возможности

**Магазин**
- Слайдер акций, меню по категориям, окно товара, выдвижная корзина
- Английский и русский интерфейс с переключателем в шапке; выбор запоминается в cookie
- Корзина сохраняется в `localStorage` и переживает перезагрузку страницы
- Проверка формы заказа в браузере и на сервере; `POST /api/orders` сам пересчитывает сумму по каталогу, цены с клиента не принимаются
- Адаптивная вёрстка, закрытие окон по Esc, подписи для экранных дикторов

**Аккаунты и заказы (Supabase)**
- Регистрация и вход по email и паролю
- Страница «Мои заказы» со статусом каждого заказа, оформленного после входа
- Панель администратора: все заказы с данными клиента и сменой статуса (Новый → Готовится → Доставлен / Отменён)
- Доступ ограничивает сама база через row-level security, а не только интерфейс: клиент видит только свои заказы, менять статусы могут только администраторы

Supabase необязателен. Без него магазин работает и сохраняет заказы в `.data/orders.json`, а страницы аккаунта скрыты.

| Корзина | Оформление заказа | Панель администратора |
|---|---|---|
| ![Корзина](docs/ru/cart.png) | ![Оформление](docs/ru/checkout.png) | ![Админка](docs/admin.png) |

## Стек

Next.js 16 (App Router, Server Actions) · React 19 · TypeScript · Tailwind CSS 4 · Framer Motion · Zustand · Supabase (Postgres, Auth, RLS) · Vitest · Playwright · GitHub Actions

## Запуск

Нужен Node.js 20.19 или новее (рекомендуется 22 LTS).

**Windows:** дважды щёлкните `run.cmd` или запустите его из терминала.

**Linux / macOS:**

```bash
./run.sh
```

Скрипт проверяет версию Node.js, при первом запуске ставит зависимости и запускает сервер разработки на http://localhost:3000. С параметром `prod` собирается и запускается production-версия: `run.cmd prod` или `./run.sh prod`.

В зависимостях есть бинарные модули под конкретную ОС. Если открывать одну и ту же папку то из Windows, то из WSL/Linux, скрипт заметит, что `node_modules` установлены под другую систему, и переустановит их.

Можно запускать и через npm напрямую:

```bash
npm install
npm run dev
```

## Настройка Supabase

**В облаке (бесплатный тариф):**

1. Создайте проект на [supabase.com](https://supabase.com).
2. Откройте *SQL Editor* и по очереди выполните файлы из [`supabase/migrations`](supabase/migrations): сначала `…_init.sql`, затем `…_grants.sql`.
3. Нажмите *Connect* вверху страницы проекта, выберите *App Frameworks → Next.js* и скопируйте две строки `NEXT_PUBLIC_…` в `.env.local` (образец в `.env.example`).
4. В *Authentication → URL Configuration* укажите в *Site URL* адрес сайта (например, `http://localhost:3000`).

**Локально (Docker):** `npx supabase start` поднимает Supabase с применённой миграцией, `npx supabase status` показывает URL и ключ для `.env.local`.

**Как назначить администратора:** после регистрации пользователя выполните в SQL Editor:

```sql
insert into admins (user_id) select id from auth.users where email = 'you@example.com';
```

После этого на его странице «Мои заказы» появится ссылка «Панель администратора».

## Деплой на Vercel

[Vercel](https://vercel.com) — хостинг от создателей Next.js с бесплатным тарифом для личных проектов.

1. Войдите в Vercel через GitHub и нажмите *Add New → Project*.
2. Импортируйте репозиторий `PizzaGo`; настройки Next.js определятся автоматически.
3. В *Environment Variables* добавьте те же две переменные, что в `.env.local` (`NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`), и нажмите *Deploy*.
4. Полученный адрес `https://….vercel.app` укажите в Supabase в *Site URL*.

Каждый push в `main` обновляет сайт. Без Supabase демо тоже работает, но заказы хранятся только во временном хранилище.

Бесплатный проект Supabase ставится на паузу после недели без активности. В [`vercel.json`](vercel.json) настроена ежедневная cron-задача Vercel: она вызывает `/api/health`, тот делает небольшой запрос к базе, и проект не засыпает.

## Тесты

| Команда | Что запускает |
|---|---|
| `npm test` | unit-тесты (Vitest): проверка заказа, корзина, переводы |
| `npm run test:e2e` | сквозные тесты (Playwright): собирает приложение и проходит оформление заказа в настоящем браузере |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |

Перед первым запуском e2e установите браузер: `npx playwright install chromium`.

GitHub Actions запускает всё это при каждом push и pull request.

## Структура

```
app/
  page.tsx               главная: слайдер и меню
  checkout/  success/    оформление заказа
  login/  account/       вход и «Мои заказы»
  admin/                 панель администратора и Server Action смены статуса
  api/orders/            API создания заказа
components/              UI-компоненты
lib/
  i18n/                  языки, словари, контекст языка
  supabase/              клиенты Supabase для сервера и браузера
  menu.ts                каталог товаров на двух языках
  order.ts               валидация заказа и пересчёт суммы
  cart-store.ts          состояние корзины (Zustand + persist)
proxy.ts                 обновляет cookie сессии Supabase
supabase/migrations/     схема базы, политики RLS, начальные данные
tests/unit/  tests/e2e/  тесты Vitest и Playwright
scripts/start.mjs        кроссплатформенный скрипт запуска
```
