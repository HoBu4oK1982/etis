<?php

return [
    'orders' => [
        // Куда Laravel отправляет уведомление о новом заказе.
        'admin_email' => env('ETIS_ORDER_ADMIN_EMAIL', 'info@etis.kz'),
    ],
];
