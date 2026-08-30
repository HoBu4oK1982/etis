@php
    $date = $order->created_at ?: now();
    $orderNumber = 'ET-' . $date->format('ym') . '-' . str_pad((string) $order->id, 6, '0', STR_PAD_LEFT);
    $isPickup = ($order->delivery_type ?? null) === 'pickup';
@endphp
<!doctype html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Заказ {{ $orderNumber }}</title>
</head>
<body style="margin:0;background:#f3f7fb;font-family:Arial,sans-serif;color:#11233d;line-height:1.55">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f7fb;padding:24px 12px">
    <tr>
        <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dfe8f2">
                <tr>
                    <td style="padding:28px 30px;background:#073b7a;color:#ffffff">
                        <div style="font-size:12px;letter-spacing:1.7px;opacity:.78">ETIS.KZ · ИНЖЕНЕРНЫЕ СИСТЕМЫ</div>
                        <h1 style="margin:8px 0 0;font-size:26px">Заказ {{ $orderNumber }}</h1>
                    </td>
                </tr>
                <tr>
                    <td style="padding:28px 30px">
                        <p style="margin:0 0 18px">Здравствуйте, <strong>{{ $order->user_name }}</strong>! Заказ принят. Менеджер проверит наличие, комплект и свяжется с вами для подтверждения.</p>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="8" style="margin-bottom:24px;background:#f7fafe;border-radius:14px">
                            <tr><td style="color:#66758a">Телефон</td><td align="right"><strong>{{ $order->mobile }}</strong></td></tr>
                            <tr><td style="color:#66758a">E-mail</td><td align="right"><strong>{{ $order->email }}</strong></td></tr>
                            <tr><td style="color:#66758a">Город</td><td align="right"><strong>{{ $order->city }}</strong></td></tr>
                            <tr><td style="color:#66758a">Получение</td><td align="right"><strong>{{ $isPickup ? 'Самовывоз' : 'Доставка' }}</strong></td></tr>
                            <tr><td style="color:#66758a">Адрес</td><td align="right"><strong>{{ $order->address ?: 'По согласованию' }}</strong></td></tr>
                        </table>

                        @if($order->comment)
                            <div style="margin-bottom:24px;padding:14px 16px;border-radius:12px;background:#eef6ff;border-left:4px solid #0b77da">
                                <strong>Комментарий:</strong><br>{{ $order->comment }}
                            </div>
                        @endif

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="10" style="border-collapse:collapse">
                            <thead>
                            <tr>
                                <th align="left" style="border-bottom:1px solid #dfe8f2;color:#66758a;font-size:12px">ТОВАР</th>
                                <th align="center" style="border-bottom:1px solid #dfe8f2;color:#66758a;font-size:12px">КОЛ-ВО</th>
                                <th align="right" style="border-bottom:1px solid #dfe8f2;color:#66758a;font-size:12px">СУММА</th>
                            </tr>
                            </thead>
                            <tbody>
                            @foreach($order->orderItems as $item)
                                <tr>
                                    <td style="border-bottom:1px solid #edf2f7"><strong>{{ $item->product?->title ?? 'Товар' }}</strong></td>
                                    <td align="center" style="border-bottom:1px solid #edf2f7">{{ $item->qty }}</td>
                                    <td align="right" style="border-bottom:1px solid #edf2f7"><strong>{{ number_format($item->price * $item->qty, 0, '.', ' ') }} тг</strong></td>
                                </tr>
                            @endforeach
                            </tbody>
                        </table>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="6" style="margin-top:18px">
                            <tr>
                                <td align="right" style="color:#66758a">Товары:</td>
                                <td align="right" width="150"><strong>{{ number_format($order->subtotal, 0, '.', ' ') }} тг</strong></td>
                            </tr>
                            <tr>
                                <td align="right" style="font-size:17px">Предварительный итог:</td>
                                <td align="right" width="150" style="font-size:21px;color:#087b49"><strong>{{ number_format($order->total, 0, '.', ' ') }} тг</strong></td>
                            </tr>
                        </table>

                        <p style="margin:24px 0 0;color:#66758a;font-size:13px">Стоимость доставки и окончательная комплектация подтверждаются менеджером ETIS.KZ.</p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
