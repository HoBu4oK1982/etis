<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Открываем /api/* для Next.js фронта.
    | В .env: FRONTEND_URL=http://localhost:3000
    | В проде: FRONTEND_URL=https://etis.kz
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter([
        env('FRONTEND_URL', 'http://localhost:3000'),
        // Локальные варианты на всякий:
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ]),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Bearer-токены, cookie не нужны -> false
    'supports_credentials' => false,

];
