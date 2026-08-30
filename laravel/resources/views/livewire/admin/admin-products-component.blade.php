<div class="container">
    <style>
        nav svg { height: 20px; }
        nav .hidden { display: block !important; }
        .btn-actions .btn { margin-right: 4px; }
        .btn-actions .btn:last-child { margin-right: 0; }
    </style>

    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Товары</h1>
        <a href="{{ route('admin.addproduct') }}" class="btn btn-primary">Создать товар</a>
    </div>

    @if (session()->has('message'))
        <div class="alert alert-success">
            {{ session('message') }}
        </div>
    @endif

    <div class="card">
        <div class="card-body">
            <div class="row mb-3">
                <div class="col-md-4">
                    <input type="text" class="form-control" placeholder="Поиск по названию / slug / SKU..." wire:model.live.debounce.400ms="search" />
                </div>
                <div class="col-md-2">
                    <select class="form-control" wire:model.live="filterStatus">
                        <option value="">Все статусы</option>
                        <option value="0">Включен</option>
                        <option value="1">Выключен</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <select class="form-control" wire:model.live="filterRemark">
                        <option value="">Все типы</option>
                        <option value="hit">Хит продаж</option>
                        <option value="new">Новинка</option>
                        <option value="sale">Акция</option>
                        <option value="none">Без типа</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <select class="form-control" wire:model.live="perPage">
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>
            </div>

            <div class="table-responsive">
                <table class="table table-bordered">
                    <thead>
                    <tr>
                        <th style="width:60px">ID</th>
                        <th>Название</th>
                        <th>Slug</th>
                        <th>SKU</th>
                        <th>Бренд</th>
                        <th>Категория</th>
                        <th style="width:130px">Цена</th>
                        <th style="width:130px">Распродажа</th>
                        <th style="width:90px">Тип</th>
                        <th style="width:110px">Статус</th>
                        <th style="width:220px">Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    @forelse($products as $p)
                        <tr>
                            <td>{{ $p->id }}</td>
                            <td>
                                <strong>{{ $p->title }}</strong>
                            </td>
                            <td><span class="badge badge-secondary">{{ $p->slug }}</span></td>
                            <td>{{ $p->sku ?: '—' }}</td>
                            <td>{{ $p->brand?->title ?: '—' }}</td>
                            <td>
                                @php($cid = $p->category_id)
                                <small class="text-muted">{{ $cid && isset($categoryPaths[$cid]) ? $categoryPaths[$cid] : '—' }}</small>
                            </td>
                            <td>{{ number_format((float)$p->price, 0, '.', ' ') }}</td>
                            <td>{{ $p->selling_price !== null ? number_format((float)$p->selling_price, 0, '.', ' ') : '—' }}</td>
                            <td>
                                @if($p->remark)
                                    <span class="badge badge-info">{{ $p->remark }}</span>
                                @else
                                    —
                                @endif
                            </td>
                            <td>
                                @if($p->status == 0)
                                    <span class="badge badge-success">Включен</span>
                                @else
                                    <span class="badge badge-danger">Выключен</span>
                                @endif
                            </td>
                            <td class="btn-actions">
                                <a class="btn btn-sm btn-info"
                                   href="{{ route('admin.editproduct', ['product_id' => $p->id]) }}"
                                   title="Редактировать">
                                    <i class="fas fa-pen"></i>
                                </a>
                                <a class="btn btn-sm btn-warning"
                                   href="{{ route('admin.duplicateproduct', ['source_id' => $p->id]) }}"
                                   title="Скопировать товар"
                                   onclick="return confirm('Открыть форму создания нового товара на основе «{{ addslashes($p->title) }}»? Все поля будут предзаполнены.');">
                                    <i class="fas fa-copy"></i> Скопировать
                                </a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="11">Товаров пока нет.</td>
                        </tr>
                    @endforelse
                    </tbody>
                </table>

                {{ $products->links('pagination-links') }}
            </div>
        </div>
    </div>

    <div class="loadingSpinner" wire:loading>
        <svg width="200" height="200" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_OSmW{transform-origin:center;animation:spinner_T6mA .75s step-end infinite}@keyframes spinner_T6mA{8.3%{transform:rotate(30deg)}16.6%{transform:rotate(60deg)}25%{transform:rotate(90deg)}33.3%{transform:rotate(120deg)}41.6%{transform:rotate(150deg)}50%{transform:rotate(180deg)}58.3%{transform:rotate(210deg)}66.6%{transform:rotate(240deg)}75%{transform:rotate(270deg)}83.3%{transform:rotate(300deg)}91.6%{transform:rotate(330deg)}100%{transform:rotate(360deg)}}</style><g class="spinner_OSmW"><rect x="11" y="1" width="2" height="5" opacity=".14"/><rect x="11" y="1" width="2" height="5" transform="rotate(30 12 12)" opacity=".29"/><rect x="11" y="1" width="2" height="5" transform="rotate(60 12 12)" opacity="1"/><rect x="11" y="1" width="2" height="5" transform="rotate(90 12 12)" opacity=".9"/><rect x="11" y="1" width="2" height="5" transform="rotate(120 12 12)" opacity=".71"/><rect x="11" y="1" width="2" height="5" transform="rotate(150 12 12)" opacity=".86"/><rect x="11" y="1" width="2" height="5" transform="rotate(180 12 12)"/></g></svg>
    </div>
</div>
