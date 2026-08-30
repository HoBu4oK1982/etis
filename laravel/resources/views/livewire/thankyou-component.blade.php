@section('title', 'ETIS - Спасибо за заказ')
@section('meta_description', 'Спасибо! Ваш заказ принят. Мы свяжемся с вами в ближайшее время для подтверждения.')
@section('meta_keywords', 'заказ, спасибо, ETIS')

<section class="container" style="padding:30px 0 60px;">
    <h1 class="commonTitle">Спасибо за заказ</h1>

    <div class="commonBreadcrumbs">
        <ul>
            <li>
                <a href="/">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M575.8 255.5c0 18-15 32.1-32 32.1l-32 0 .7 160.2c0 2.7-.2 5.4-.5 8.1l0 16.2c0 22.1-17.9 40-40 40l-16 0c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1L416 512l-24 0c-22.1 0-40-17.9-40-40l0-24 0-64c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32 14.3-32 32l0 64 0 24c0 22.1-17.9 40-40 40l-24 0-31.9 0c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2l-16 0c-22.1 0-40-17.9-40-40l0-112c0-.9 0-1.9 .1-2.8l0-69.7-32 0c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/></svg>
                </a>
            </li>
            /
            <li>Спасибо за заказ</li>
        </ul>
    </div>

    <style>
        .thx-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:18px;align-items:start;margin-top:18px}
        .thx-card{background:linear-gradient(135deg,#0b2447 0%, #0a1a2f 100%);border-radius:18px;padding:22px;color:#fff;position:relative;overflow:hidden}
        .thx-card:before{content:'';position:absolute;top:-120px;right:-120px;width:240px;height:240px;background:rgba(255,255,255,.08);border-radius:999px}
        .thx-head{display:flex;gap:14px;align-items:flex-start}
        .thx-icon{width:56px;height:56px;border-radius:16px;background:rgba(0,255,153,.14);display:flex;align-items:center;justify-content:center;flex:0 0 56px}
        .thx-icon svg{width:28px;height:28px}
        .thx-title{margin:0;font-size:26px;font-weight:800;line-height:1.2}
        .thx-sub{margin:8px 0 0;opacity:.9;line-height:1.5}
        .thx-kv{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:16px}
        .thx-kvItem{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px}
        .thx-kvItem .lbl{font-size:12px;opacity:.8}
        .thx-kvItem .val{margin-top:6px;font-size:16px;font-weight:800;word-break:break-word}

        .thx-side{border:1px solid #e8e8e8;border-radius:18px;background:#fff;padding:18px}
        .thx-side h3{margin:0 0 12px;font-size:18px}
        .thx-steps{display:grid;gap:10px}
        .thx-step{display:flex;gap:10px;align-items:flex-start}
        .thx-dot{width:22px;height:22px;border-radius:999px;background:#111;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;flex:0 0 22px;margin-top:2px}
        .thx-step b{display:block}
        .thx-step p{margin:2px 0 0;opacity:.85;font-size:13px;line-height:1.4}

        .thx-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:16px}
        .thx-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:12px 16px;border-radius:14px;text-decoration:none;font-weight:800;border:1px solid rgba(255,255,255,.18);color:#fff;background:rgba(255,255,255,.08)}
        .thx-btn:hover{background:rgba(255,255,255,.12)}
        .thx-btn--primary{background:#00b7ff;border-color:#00b7ff;color:#fff}
        .thx-btn--primary:hover{background:#0aa8e6;border-color:#0aa8e6}

        .thx-links{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
        .thx-link{display:inline-flex;align-items:center;gap:8px;padding:10px 12px;border-radius:12px;border:1px solid #eee;background:#fafafa;color:#111;text-decoration:none;font-weight:700}
        .thx-link:hover{background:#f2f2f2}
        .thx-link svg{width:16px;height:16px;opacity:.75}

        @media (max-width: 992px){
            .thx-grid{grid-template-columns:1fr;}
            .thx-kv{grid-template-columns:1fr;}
        }
    </style>

    @php
        $status = $order->status ?? null;
        $statusLabel = match($status) {
            'paid' => 'Оплачен',
            'delivered' => 'Отгружен',
            'canceled' => 'Отменён',
            default => 'Получен',
        };
    @endphp

    <div class="thx-grid">
        {{-- Main card --}}
        <div class="thx-card">
            <div class="thx-head">
                <div class="thx-icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path fill="currentColor" d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208s208-93.1 208-208S370.9 48 256 48zm104.3 150.3l-120 120c-6.2 6.2-16.4 6.2-22.6 0l-56-56c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0L228 284.7l108.7-108.7c6.2-6.2 16.4-6.2 22.6 0s6.3 16.4 0 22.6z"/>
                    </svg>
                </div>
                <div>
                    <h2 class="thx-title">Заказ принят ✅</h2>
                    <p class="thx-sub">
                        Спасибо! Мы получили ваш заказ и свяжемся с вами в ближайшее время для подтверждения.
                        @if($order)
                            <br><b>Статус:</b> {{ $statusLabel }}
                        @endif
                    </p>
                </div>
            </div>

            <div class="thx-kv">
                <div class="thx-kvItem">
                    <div class="lbl">Номер заказа</div>
                    <div class="val">{{ $order ? '№'.$order->id : '—' }}</div>
                </div>
                <div class="thx-kvItem">
                    <div class="lbl">Дата</div>
                    <div class="val">{{ $order?->created_at?->format('d.m.Y H:i') ?? '—' }}</div>
                </div>
                <div class="thx-kvItem">
                    <div class="lbl">Товаров</div>
                    <div class="val">{{ $order?->order_items_count ?? '—' }}</div>
                </div>
                <div class="thx-kvItem">
                    <div class="lbl">Итого</div>
                    <div class="val">
                        {{ $order ? number_format((int)$order->total, 0, '.', ' ') . ' 〒' : '—' }}
                    </div>
                </div>
            </div>

            <div class="thx-actions">
                <a class="thx-btn thx-btn--primary" href="/">Продолжить покупки</a>
                @auth
                    <a class="thx-btn" href="{{ route('user.dashboard', ['tab' => 'orders']) }}">Мои заказы</a>
                @endauth
                <a class="thx-btn" href="{{ route('contacts') }}">Контакты</a>
            </div>
        </div>

        {{-- Side info --}}
        <aside class="thx-side">
            <h3>Что дальше?</h3>

            <div class="thx-steps">
                <div class="thx-step">
                    <div class="thx-dot">1</div>
                    <div>
                        <b>Подтверждение</b>
                        <p>Менеджер уточнит детали заказа и способ получения.</p>
                    </div>
                </div>
                <div class="thx-step">
                    <div class="thx-dot">2</div>
                    <div>
                        <b>Подготовка</b>
                        <p>Мы соберём заказ и сообщим о готовности / отправке.</p>
                    </div>
                </div>
                <div class="thx-step">
                    <div class="thx-dot">3</div>
                    <div>
                        <b>Получение</b>
                        <p>Вы получите заказ, а мы будем на связи по любым вопросам.</p>
                    </div>
                </div>
            </div>

            <div class="thx-links">
                <a class="thx-link" href="{{ route('cart') }}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M96 0C78.3 0 64 14.3 64 32c0 17.7 14.3 32 32 32l21.5 0 53.5 256.1c-1.6 5.4-2.5 11.1-2.5 17.1c0 35.3 28.7 64 64 64l256 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-256 0c-2.8 0-5.5-.4-8.1-1.1l8.3-32.9 246.8 0c29.1 0 54.2-20.5 60.2-48.9L566.8 90.7c6.6-30.9-16.9-58.7-48.5-58.7L143.4 32 137.6 4.4C134.9 1.8 131.5 0 128 0L96 0z"/></svg>
                    Вернуться в корзину
                </a>
                <a class="thx-link" href="{{ route('contacts') }}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208s208-93.1 208-208S370.9 48 256 48zM232 152c0-13.3 10.7-24 24-24s24 10.7 24 24v120c0 13.3-10.7 24-24 24s-24-10.7-24-24V152zm24 248a28 28 0 1 1 0-56 28 28 0 1 1 0 56z"/></svg>
                    Нужна помощь?
                </a>
            </div>

            <div style="margin-top:14px;font-size:13px;opacity:.8;line-height:1.45;">
                Если хотите ускорить обработку — напишите нам через страницу контактов.
            </div>
        </aside>
    </div>
</section>
