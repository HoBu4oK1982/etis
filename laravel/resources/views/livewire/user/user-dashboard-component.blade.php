<div>
    <style>
        .uc-layout{display:flex;gap:24px;align-items:flex-start}
        .uc-sidebar{width:280px;flex:0 0 280px}
        .uc-content{flex:1;min-width:0}

        .uc-card{border:1px solid #ddd;border-radius:12px;padding:16px;background:#fff}
        .uc-card + .uc-card{margin-top:14px}

        .uc-menu{border:1px solid #ddd;border-radius:12px;padding:12px;background:#fff}
        .uc-menu h4{margin:0 0 10px;font-size:16px}
        .uc-menu a{display:flex;align-items:center;gap:10px;width:90%;text-align:left;padding:10px 12px;border-radius:10px;background:transparent;cursor:pointer;color:#222;text-decoration:none}
        .uc-menu a:hover{background:#f5f5f5}
        .uc-menu .is-active{background:#111;color:#fff}
        .uc-menu .is-active:hover{background:#111}
        .uc-menu .uc-badge{margin-left:auto;font-size:12px;opacity:.85}
        .uc-menu .is-active .uc-badge{opacity:1}

        .uc-title{margin:0 0 12px;font-size:22px}

        .uc-grid{display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:12px}
        .uc-stat{border:1px solid #e5e5e5;border-radius:12px;padding:12px;background:#fafafa}
        .uc-stat .lbl{font-size:12px;opacity:.8}
        .uc-stat .val{font-size:18px;font-weight:700;margin-top:4px}

        .uc-table{width:100%;border-collapse:collapse}
        .uc-table th,.uc-table td{padding:10px;border-bottom:1px solid #eee;vertical-align:middle}
        .uc-table th{font-size:12px;text-transform:uppercase;letter-spacing:.02em;opacity:.75;text-align:left}

        .uc-status{display:inline-flex;align-items:center;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600}
        .uc-status--ordered{background:#e8f0ff;color:#1f4bb8}
        .uc-status--delivered{background:#e8fff0;color:#117a3a}
        .uc-status--canceled{background:#ffeaea;color:#b11212}
        .uc-status--paid{background:#cdffd5;color:#3b8a4f}

        .uc-btn{display:inline-flex;align-items:center;gap:8px;border-radius:10px;padding:8px 12px;border:1px solid #ddd;background:#fff;cursor:pointer;text-decoration:none;color:#111}
        .uc-btn:hover{background:#f5f5f5}
        .uc-btn--primary{background:#111;color:#fff;border-color:#111}
        .uc-btn--primary:hover{background:#000}

        .uc-formRow{display:flex;gap:12px;flex-wrap:wrap}
        .uc-field{flex:1;min-width:220px}
        .uc-field label{display:block;font-size:12px;opacity:.8;margin-bottom:6px}
        .uc-field input{width:90%;border:1px solid #ddd;border-radius:10px;padding:10px 12px}
        .uc-field textarea{width:95%;border:1px solid #ddd;border-radius:10px;padding:10px 12px;min-height:90px;resize:vertical}
        .uc-help{font-size:12px;opacity:.75;margin-top:6px}

        .uc-profileHead{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
        .uc-avatar{width:64px;height:64px;border-radius:999px;overflow:hidden;border:1px solid #e5e5e5;background:#f3f3f3;flex:0 0 64px}
        .uc-avatar img{width:100%;height:100%;object-fit:cover;display:block}

        .uc-w-grid{display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:12px;margin-top:14px}
        .uc-w-item{border:1px solid #eee;border-radius:12px;padding:12px;background:#fff;display:flex;gap:12px}
        .uc-w-img{width:90px;flex:0 0 90px}
        .uc-w-img img{width:90px;height:90px;border-radius:10px;object-fit:cover;display:block;border:1px solid #eee}
        .uc-w-body{flex:1;min-width:0}
        .uc-w-title{font-weight:700;margin:0 0 6px}
        .uc-w-price{font-weight:800;margin-top:6px}
        .uc-w-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}

        @media (max-width: 992px){
            .uc-layout{flex-direction:column}
            .uc-sidebar{width:100%;flex:0 0 auto}
            .uc-grid{grid-template-columns:repeat(2, minmax(0, 1fr))}
            .uc-w-grid{grid-template-columns:repeat(1, minmax(0, 1fr))}
        }
        @media (max-width: 576px){
            .uc-grid{grid-template-columns:repeat(1, minmax(0, 1fr))}
        }
    </style>

    <div class="container" style="padding:30px 0;">
        <h1 class="commonTitle">Личный кабинет</h1>

        <div class="uc-layout">
            {{-- Sidebar --}}
            <aside class="uc-sidebar">
                <div class="uc-card" style="margin-bottom:14px;">
                    <div class="uc-profileHead">
                        <div class="uc-avatar">
                            {{-- ✅ Breeze: без Jetstream profile_photo_url --}}
                            <img src="{{ asset('assets/images/design/no-avatar.png') }}" alt="{{ $user->name }}">
                        </div>
                        <div>
                            <div style="font-size:18px;font-weight:800;">{{ $user->name }}</div>
                            <div class="uc-help">{{ $user->email }}</div>
                            <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
                                @if($user->hasRole('client'))
                                    <span class="uc-status uc-status--delivered">Клиент</span>
                                @else
                                    <span class="uc-status uc-status--ordered">Пользователь</span>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>

                <div class="uc-menu">
                    <h4>Меню</h4>

                    <a href="#" wire:click.prevent="setTab('dashboard')" class="{{ $tab === 'dashboard' ? 'is-active' : '' }}">
                        <span>🏠</span><span>Дашборд</span>
                    </a>

                    <a href="#" wire:click.prevent="setTab('orders')" class="{{ $tab === 'orders' ? 'is-active' : '' }}">
                        <span>🧾</span><span>Мои заказы</span>
                        <span class="uc-badge">{{ $ordersCount }}</span>
                    </a>

                    <a href="#" wire:click.prevent="setTab('wishlist')" class="{{ $tab === 'wishlist' ? 'is-active' : '' }}">
                        <span>❤️</span><span>Избранное</span>
                        <span class="uc-badge">{{ $wishlistCount }}</span>
                    </a>

                    <a href="#" wire:click.prevent="setTab('profile')" class="{{ $tab === 'profile' ? 'is-active' : '' }}">
                        <span>👤</span><span>Профиль</span>
                    </a>

                    <a href="{{ route('logout') }}"
                       onclick="event.preventDefault(); document.getElementById('uc-logout-form').submit();">
                        <span>🚪</span><span>Выйти</span>
                    </a>

                    <form id="uc-logout-form" action="{{ route('logout') }}" method="POST" style="display:none;">
                        @csrf
                    </form>
                </div>
            </aside>

            {{-- Content --}}
            <section class="uc-content">

                {{-- DASHBOARD --}}
                @if($tab === 'dashboard')
                    <div class="uc-card">
                        <h2 class="uc-title">Привет, {{ $user->name }} 👋</h2>
                        <div class="uc-help">Короткая сводка по аккаунту.</div>

                        <div style="margin-top:14px" class="uc-grid">
                            <div class="uc-stat">
                                <div class="lbl">Роль</div>
                                <div class="val">{{ $user->hasRole('client') ? 'Клиент' : 'Пользователь' }}</div>
                            </div>
                            <div class="uc-stat">
                                <div class="lbl">Заказов</div>
                                <div class="val">{{ $ordersCount }}</div>
                            </div>
                            <div class="uc-stat">
                                <div class="lbl">Избранное</div>
                                <div class="val">{{ $wishlistCount }}</div>
                            </div>
                        </div>

                        <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
                            <a class="uc-btn uc-btn--primary" href="#" wire:click.prevent="setTab('orders')">Мои заказы</a>
                            <a class="uc-btn" href="#" wire:click.prevent="setTab('wishlist')">Избранное</a>
                            <a class="uc-btn" href="{{ route('cart') }}">Корзина</a>
                        </div>
                    </div>
                @endif

                {{-- ORDERS --}}
                @if($tab === 'orders')
                    <div class="uc-card">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
                            <h2 class="uc-title" style="margin:0;">Мои заказы</h2>
                            @if($selectedOrder)
                                <button class="uc-btn" wire:click="backToOrders">← Назад</button>
                            @endif
                        </div>

                        @if($selectedOrder)
                            @php $status = $selectedOrder->status; @endphp

                            <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
                                <div style="font-weight:800;font-size:18px;">Заказ №{{ $selectedOrder->id }}</div>
                                <div class="uc-help">от {{ $selectedOrder->created_at->format('d.m.Y H:i') }}</div>

                                @if($status === 'ordered')
                                    <span class="uc-status uc-status--ordered">Получен</span>
                                @elseif($status === 'paid')
                                    <span class="uc-status uc-status--paid">Оплачен</span>
                                @elseif($status === 'delivered')
                                    <span class="uc-status uc-status--delivered">Доставлен</span>
                                @elseif($status === 'canceled')
                                    <span class="uc-status uc-status--canceled">Отменён</span>
                                @endif
                            </div>

                            <div style="margin-top:14px;overflow:auto;">
                                <table class="uc-table">
                                    <thead>
                                        <tr>
                                            <th>Товар</th>
                                            <th style="width:120px;">Цена</th>
                                            <th style="width:90px;">Кол-во</th>
                                            <th style="width:140px;">Сумма</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach($selectedOrder->orderItems as $item)
                                            <tr>
                                                <td>
                                                    {{-- ✅ FIX: параметр slug --}}
                                                    <a href="{{ route('product.details', ['slug' => $item->product->slug]) }}" style="text-decoration:none;">
                                                        {{ $item->product->title ?? $item->product->name ?? 'Товар' }}
                                                    </a>
                                                </td>
                                                <td>{{ $item->price }} 〒</td>
                                                <td>{{ $item->qty }}</td>
                                                <td>{{ $item->price * $item->qty }} 〒</td>
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>

                            <div style="margin-top:14px;display:flex;justify-content:flex-end;">
                                <div style="min-width:280px;border:1px solid #eee;border-radius:12px;padding:12px;background:#fafafa;">
                                    <div style="display:flex;justify-content:space-between;gap:10px;">
                                        <div>Сумма:</div>
                                        <div style="font-weight:800;">{{ $selectedOrder->subtotal }} 〒</div>
                                    </div>
                                    <div style="display:flex;justify-content:space-between;gap:10px;margin-top:10px;font-size:16px;">
                                        <div><b>Итого:</b></div>
                                        <div><b>{{ $selectedOrder->total }} 〒</b></div>
                                    </div>
                                </div>
                            </div>
                        @else
                            <div style="margin-top:12px;overflow:auto;">
                                <table class="uc-table">
                                    <thead>
                                        <tr>
                                            <th style="width:90px;">Номер</th>
                                            <th style="width:160px;">Дата</th>
                                            <th style="width:140px;">Статус</th>
                                            <th style="width:140px;">Итого</th>
                                            <th style="width:140px;">Действие</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @forelse($orders as $order)
                                            <tr>
                                                <td>№{{ $order->id }}</td>
                                                <td>{{ $order->created_at->format('d.m.Y H:i') }}</td>
                                                <td>
                                                    @if ($order->status === 'ordered')
                                                        <span class="uc-status uc-status--ordered">Получен</span>
                                                    @elseif ($order->status === 'paid')
                                                        <span class="uc-status uc-status--paid">Оплачен</span>
                                                    @elseif ($order->status === 'delivered')
                                                        <span class="uc-status uc-status--delivered">Отгружен</span>
                                                    @elseif ($order->status === 'canceled')
                                                        <span class="uc-status uc-status--canceled">Отменён</span>
                                                    @endif
                                                </td>
                                                <td><b>{{ $order->total }} 〒</b></td>
                                                <td>
                                                    <button class="uc-btn" wire:click="viewOrder({{ (int)$order->id }})">Подробнее</button>
                                                </td>
                                            </tr>
                                        @empty
                                            <tr><td colspan="5">У вас пока нет заказов.</td></tr>
                                        @endforelse
                                    </tbody>
                                </table>
                            </div>

                            <div style="margin-top:12px;">
                                {{ $orders->links('pagination-links') }}
                            </div>
                        @endif
                    </div>
                @endif

                {{-- WISHLIST --}}
                @if($tab === 'wishlist')
                    <div class="uc-card">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
                            <h2 class="uc-title" style="margin:0;">Избранное</h2>
                            <a class="uc-btn" href="{{ route('favourite') }}">Открыть страницу избранного</a>
                        </div>

                        @if(\Cart::instance('wishlist')->content()->count() > 0)
                            <div class="uc-w-grid">
                                @foreach(\Cart::instance('wishlist')->content() as $item)
                                    @php
                                        $model = $item->model ?? null;
                                        $slug = $model?->slug ?? ($item->options->slug ?? null);
                                        $title = $model->title ?? $model->name ?? $item->name ?? 'Товар';
                                        $price = $model->price ?? $item->price ?? null;

                                        $img = null;
                                        // если у модели есть relation images (как у тебя в товарах) — берём первое
                                        if ($model && method_exists($model, 'images')) {
                                            $firstImg = $model->images()->first();
                                            $img = $firstImg?->file_name ? asset('assets/images/products/'.$firstImg->file_name) : null;
                                        }
                                        // если вдруг images просто строкой (старый код) — тоже обработаем
                                        if (!$img && $model && !empty($model->images) && is_string($model->images)) {
                                            $img = asset('assets/images/products/'.$model->images);
                                        }
                                        if (!$img) {
                                            $img = asset('assets/images/design/no-image.jpg');
                                        }
                                    @endphp

                                    <div class="uc-w-item" wire:key="wish-{{ $item->rowId }}">
                                        <div class="uc-w-img">
                                            @if($slug)
                                                {{-- ✅ FIX: параметр slug --}}
                                                <a href="{{ route('product.details', ['slug' => $slug]) }}">
                                                    <img src="{{ $img }}" alt="{{ $title }}">
                                                </a>
                                            @else
                                                <img src="{{ $img }}" alt="{{ $title }}">
                                            @endif
                                        </div>

                                        <div class="uc-w-body">
                                            <p class="uc-w-title">
                                                @if($slug)
                                                    <a href="{{ route('product.details', ['slug' => $slug]) }}" style="text-decoration:none;">
                                                        {{ $title }}
                                                    </a>
                                                @else
                                                    {{ $title }}
                                                @endif
                                            </p>

                                            @if(!is_null($price))
                                                <div class="uc-w-price">{{ $price }} 〒</div>
                                            @endif

                                            <div class="uc-w-actions">
                                                <a href="#" class="uc-btn uc-btn--primary"
                                                   wire:click.prevent="moveProductFromWishlistToCart('{{ $item->rowId }}')"
                                                   wire:loading.attr="disabled">
                                                    В корзину
                                                </a>

                                                <a href="#" class="uc-btn"
                                                   wire:click.prevent="removeFromWishlist({{ (int)($model->id ?? $item->id) }})"
                                                   wire:loading.attr="disabled">
                                                    Убрать
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        @else
                            <div style="margin-top:14px;" class="uc-help">В избранном пока ничего нет.</div>
                        @endif
                    </div>
                @endif

                {{-- PROFILE --}}
                @if($tab === 'profile')
                    <div class="uc-card">
                        <h2 class="uc-title" style="margin:0;">Профиль</h2>
                        <div class="uc-help">Заполните данные для доставки и связи.</div>

                        @if (session()->has('profile_saved'))
                            <div style="margin-top:12px;padding:10px 12px;border:1px solid #d1fae5;background:#ecfdf5;border-radius:12px;">
                                {{ session('profile_saved') }}
                            </div>
                        @endif

                        <form wire:submit.prevent="updateProfile" style="margin-top:16px;">
                            <div class="uc-formRow">
                                <div class="uc-field">
                                    <label>Имя</label>
                                    <input type="text" wire:model.defer="name" placeholder="Ваше имя">
                                    @error('name')
                                        <div class="uc-help" style="color:#b11212;">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="uc-field">
                                    <label>Email</label>
                                    <input type="email" value="{{ $email }}" readonly>
                                    <div class="uc-help">Email менять можно через админа.</div>
                                </div>
                            </div>

                            <div class="uc-formRow" style="margin-top:12px;">
                                <div class="uc-field">
                                    <label>Мобильный телефон</label>
                                    <input type="text" wire:model.defer="phone" placeholder="+7 777 123 45 67">
                                    @error('phone')
                                        <div class="uc-help" style="color:#b11212;">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="uc-field">
                                    <label>Город</label>
                                    <input type="text" wire:model.defer="city" placeholder="Алматы">
                                    @error('city')
                                        <div class="uc-help" style="color:#b11212;">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="uc-formRow" style="margin-top:12px;">
                                <div class="uc-field" style="flex:1 1 100%; min-width:220px;">
                                    <label>Адрес</label>
                                    <textarea wire:model.defer="address" placeholder="Улица, дом, квартира"></textarea>
                                    @error('address')
                                        <div class="uc-help" style="color:#b11212;">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
                                <button type="submit" class="uc-btn uc-btn--primary" wire:loading.attr="disabled">
                                    <span wire:loading.remove>Сохранить</span>
                                    <span wire:loading>Сохраняем…</span>
                                </button>
                            </div>
                        </form>
                    </div>
                @endif

            </section>
        </div>
    </div>
</div>