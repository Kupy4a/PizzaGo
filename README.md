# PizzaGo

**English** | [Русский](README.ru.md)

A pizza delivery storefront: menu by category, product details, cart and checkout. The interface is available in English and Russian.

![Home page](docs/home.png)

## Features

- Promo slider with autoplay, pause on hover and manual navigation
- Menu grouped by category (pizza, desserts, drinks) with smooth scrolling from the header
- Product modal, slide-over cart and item counter in the header
- English / Russian interface with a switcher in the header; the choice is remembered in a cookie
- The cart is saved in `localStorage` and survives page reloads
- Checkout form validated both in the browser and on the server
- The `POST /api/orders` endpoint recalculates the total from the catalog and never trusts prices sent by the client
- Orders are stored in Supabase, or in a local `.data/orders.json` file when Supabase isn't configured
- Responsive layout, Esc closes dialogs, labelled controls for screen readers

| Cart | Checkout |
|---|---|
| ![Cart](docs/cart.png) | ![Checkout](docs/checkout.png) |

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Framer Motion · Zustand · Supabase

## Getting started

Requires Node.js 20.9 or newer (22 LTS recommended).

**Windows:** double-click `run.cmd` or run it from a terminal.

**Linux / macOS:**

```bash
./run.sh
```

The launcher checks the Node.js version, installs dependencies on the first run and starts the dev server at http://localhost:3000. Pass `prod` to build and run the production version: `run.cmd prod` or `./run.sh prod`.

Dependencies include native binaries built for one operating system. If you open the same folder from Windows and from WSL/Linux, the launcher notices that `node_modules` belongs to the other system and reinstalls it.

You can also use npm directly:

```bash
npm install
npm run dev
```

### Supabase (optional)

1. Create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql) in the SQL Editor. It creates the tables and row-level security policies and seeds the menu.
2. Copy `.env.example` to `.env.local` and fill in the project URL and anon key.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | development server |
| `npm run build` | production build |
| `npm start` | run the production build |
| `npm run lint` | ESLint |
| `npm run launch` | same as `run.cmd` / `run.sh` |

## Project structure

```
app/
  page.tsx            home page: slider and menu
  checkout/           checkout form
  success/            order confirmation
  api/orders/         order creation endpoint
components/           UI components (cart, cards, dialogs, header, language switcher)
lib/
  i18n/               locales, dictionaries, language context
  menu.ts             product catalog and banners in both languages
  order.ts            order validation and total calculation
  cart-store.ts       cart state (Zustand + persist)
scripts/start.mjs     cross-platform launcher
supabase/schema.sql   database schema
```
