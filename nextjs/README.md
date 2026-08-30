# etis.kz — фронт на Next.js

Витрина интернет-магазина. Работает поверх Laravel API (`api.etis.kz` / `127.0.0.1:8000` в dev).

## Стек

- **Next.js 15** (App Router, React 19, TypeScript strict)
- **Tailwind CSS v4** — тема через CSS переменные, без tailwind.config
- **TanStack Query** — кэш серверных данных на клиенте
- **Zustand** — корзина и wishlist с persist в localStorage
- **Zod + React Hook Form** — формы (checkout, регистрация)
- **Framer Motion** — переходы UI
- **Axios** — клиентские запросы с Bearer токеном
- **lucide-react** — иконки

## Стратегия рендеринга

| Страница | Стратегия | Revalidate |
|----------|-----------|------------|
| `/` (главная) | ISR | 300 сек |
| `/category/*` | ISR | 180 сек |
| `/product/[slug]` | ISR | 600 сек |
| `/brands` | ISR | 600 сек |
| `/articles` | ISR | 600 сек |
| `/cart`, `/checkout`, `/account` | CSR (только клиент) | — |

## Запуск

1. Распаковать архив в пустую папку.

2. Установить зависимости:
```bash
npm install
```

3. Проверить `.env.local` — должен быть URL твоего API:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Убедиться что Laravel запущен и отвечает:
```bash
# в другом терминале, в папке Laravel:
php artisan serve
# проверить: http://127.0.0.1:8000/api/v1/home должен вернуть JSON
```

5. Стартовать Next.js:
```bash
npm run dev
```

6. Открыть `http://localhost:3000`.

Если API не отвечает — увидишь красивую заглушку с чек-листом что проверить.

## Структура

```
app/
├── (shop)/                    ← магазинный layout: header + footer
│   ├── layout.tsx
│   └── page.tsx               ← главная (fetch /api/v1/home)
├── layout.tsx                 ← root
├── providers.tsx              ← TanStack Query
├── globals.css                ← Tailwind v4 + тема
└── not-found.tsx

components/
├── layout/
│   ├── Header.tsx             ← sticky, поиск, корзина, счётчик из Zustand
│   └── Footer.tsx
├── product/
│   └── ProductCard.tsx        ← карточка товара, "в корзину" кладёт в Zustand
├── home/
│   ├── HeroSlider.tsx         ← слайдер с автопрокруткой (framer-motion)
│   ├── CategoryTiles.tsx      ← плитки корневых категорий
│   ├── ProductSection.tsx     ← блок товаров (hits/sales/news)
│   └── ArticleGrid.tsx        ← статьи
└── ui/                        ← пока пусто, для базовых кнопок и т.д.

lib/
├── api/
│   ├── server.ts              ← apiGet/apiPost поверх fetch с ISR
│   ├── client.ts              ← axios с Bearer токеном (для клиентских хуков)
│   ├── home.ts                ← getHome()
│   ├── products.ts            ← getProducts, getProduct, validateCart
│   ├── categories.ts          ← getCategoryTree, getCategory, getCategoryProducts
│   └── catalog.ts             ← бренды и статьи
├── types/
│   ├── api.ts                 ← ApiSingle<T>, Paginated<T>
│   ├── product.ts
│   ├── category.ts
│   ├── misc.ts                ← Brand, Article, Slider
│   └── home.ts                ← HomeData
├── stores/
│   └── cart.ts                ← Zustand cart с persist
└── utils/
    ├── cn.ts                  ← clsx + tailwind-merge
    └── price.ts               ← formatPrice ("5000" → "5 000 ₸")
```

## Что уже работает

- ✅ Главная страница с данными из твоего API (`/api/v1/home`)
- ✅ Красивая заглушка если API недоступен
- ✅ Sticky header с поиском и счётчиком корзины
- ✅ Footer
- ✅ Плитки категорий, секции хитов/акций/новинок
- ✅ Слайдер с автопрокруткой
- ✅ Карточка товара с кнопкой «в корзину» (Zustand + localStorage)
- ✅ Метки хит/новинка/акция, вывод скидочной цены
- ✅ Полная типизация под ответы Laravel API

## Что дальше по итерациям

**Итерация 3 — Каталог:**
- `/category/[slug]` + `[...path]` (вложенность до 5 уровней)
- `/product/[slug]` с галереей и характеристиками
- `/brands`, `/shop`

**Итерация 4 — Корзина и wishlist:**
- `/cart`, `/favourite`
- CartDrawer в хедере
- Валидация цен на бэке через `POST /cart/validate`

**Итерация 5 — Auth:**
- Sanctum tokens
- `/login`, `/register` + Next.js route handlers прокси
- httpOnly cookie для токена

**Итерация 6 — Заказ:**
- `/checkout` с RHF + Zod
- `POST /orders`
- `/thankyou`

**Итерация 7 — Личный кабинет, SEO:**
- `/account`, `/account/orders`
- Статьи
- sitemap.ts, robots.ts, JSON-LD

## Известное на будущее

- **Иконки для категорий**: сейчас fallback на первую букву. Когда добавишь картинки категорий в бэке — сами подтянутся.
- **Slug slug**: изображения тянутся напрямую с бэка Laravel через `next/image`. Хосты разрешены в `next.config.ts` (127.0.0.1, localhost, api.etis.kz).
- **Токен авторизации**: пока просто localStorage — временно, чтобы клиент собирался. На этапе auth перенесём в httpOnly cookie через `/api/auth/*` route handlers.
- **Tailwind v4**: конфига нет, всё через `@theme` в globals.css.
