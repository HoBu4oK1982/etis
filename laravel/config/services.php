<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],
        'nocaptcha' => [
        'sitekey' => env('NOCAPTCHA_SITEKEY'),
        'secret' => env('NOCAPTCHA_SECRET'),
        'version' => 'v3',
    ],

    /*
    |--------------------------------------------------------------------------
    | Next.js frontend — точечная инвалидация ISR-кэша
    |--------------------------------------------------------------------------
    |
    | При изменениях в админке (Product / Category / Brand / Article / Slider)
    | Laravel-обзерверы шлют POST на /api/revalidate во фронте с набором тегов.
    | Next.js вызывает revalidateTag() — соответствующие страницы получают
    | свежие данные при ближайшем запросе, без ручной очистки кэша.
    |
    | .env:
    |   NEXT_REVALIDATE_URL=http://localhost:3000/api/revalidate
    |   NEXT_REVALIDATE_SECRET=change_me_to_random_string
    |   NEXT_REVALIDATE_TIMEOUT=3
    |
    | Тот же секрет в Next.js: REVALIDATE_SECRET=change_me_to_random_string
    |
    | Если URL или SECRET не заданы — сервис молча ничего не делает,
    | админка продолжает работать. Так безопасно катить фичу поэтапно.
    */
    'next' => [
        'revalidate_url'     => env('NEXT_REVALIDATE_URL'),
        'revalidate_secret'  => env('NEXT_REVALIDATE_SECRET'),
        'revalidate_timeout' => (int) env('NEXT_REVALIDATE_TIMEOUT', 3),
    ],

    /*
    |--------------------------------------------------------------------------
    | Anthropic (Claude API)
    |--------------------------------------------------------------------------
    |
    | Используется командой php artisan etis:seo:categories для генерации
    | мета-тегов и SEO-текстов категорий.
    |
    | .env:
    |   ANTHROPIC_API_KEY=sk-ant-...
    |
    | Без ключа команда завершается с понятной ошибкой и ничего не пишет в БД.
    */
    'anthropic' => [
        'key' => env('ANTHROPIC_API_KEY'),
    ],

];
