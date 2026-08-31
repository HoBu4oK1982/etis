# ETIS.KZ

B2B e-commerce платформа для отопительного, HVAC и сантехнического оборудования в Казахстане.

## Архитектура

- **Backend**: Laravel 10 (headless API, Sanctum) — `api.etis.kz`, код в `laravel/`
- **Frontend**: Next.js 15 App Router — `etis.kz`, код в `nextjs/`
- **Сервер**: Debian, nginx, PHP 8.2-FPM, MariaDB, PM2, Node.js 20

## API

Все эндпоинты под `/api/v1/`: home, categories (tree/top/{slug}/{slug}/products), brands, products, cart/validate, search, articles, orders, auth, account.

## Модели

- **Product**: title, slug, sku, price, selling_price, qty, brand_id, category_id, description, meta_title, meta_description, meta_keywords, status
- **Category**: иерархия parent_id до 5 уровней, slug, meta_*
- **Brand**: title, slug, meta_*
- **Article**: title, slug, meta_*

## Frontend роуты

`app/(shop)/`: home, search, shop, category/[slug]/[...path], product/[slug], brands, brands/[slug], hits, sales, news, articles, article/[slug], about, contacts, delivery, compare, cart, favourite, checkout, thank-you, account/*
`app/(auth)/`: login, register

## Правила

- Язык интерфейса: русский
- Валюта: KZT (₸), определена в `lib/utils/price.ts`
- Не менять существующую функциональность
- Коммиты на русском
- Тестировать после изменений
