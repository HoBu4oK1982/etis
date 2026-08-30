<div class="container">
    <style>
        nav svg { height: 20px; }
        nav .hidden { display: block !important; }
    </style>

    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Категории товаров</h1>
        <a href="{{ route('admin.addcategory') }}" class="btn btn-primary">Создать категорию</a>
    </div>

    @if (session()->has('message'))
        <div class="alert alert-success">
            {{ session('message') }}
        </div>
    @endif

    <div class="card">
        <div class="card-body">
            <div class="row mb-3">
                <div class="col-md-5">
                    <input type="text" class="form-control" placeholder="Поиск по названию или slug..." wire:model.live.debounce.400ms="search" />
                </div>
                <div class="col-md-3">
                    <select class="form-control" wire:model.live="filterStatus">
                        <option value="">Все статусы</option>
                        <option value="0">Включен</option>
                        <option value="1">Выключен</option>
                    </select>
                </div>
                @if (trim($search) === '')
                    <div class="col-md-4 d-flex align-items-center justify-content-end">
                        <small class="text-muted">Нажимай ▸ для раскрытия дерева.</small>
                    </div>
                @endif
            </div>

            <div class="table-responsive">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th style="width: 60px;">ID</th>
                            <th>Название</th>
                            <th>Транслит</th>
                            <th style="width: 90px;">Позиция</th>
                            <th style="width: 110px;">Статус</th>
                            <th style="width: 140px;">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($rows as $row)
                            @php($cat = $row['category'])
                            <tr>
                                <td>{{ $cat->id }}</td>
                                <td>
                                    <div class="d-flex align-items-center" style="gap: 6px;">
                                        @if (trim($search) === '' && !empty($row['has_children']))
                                            <button
                                                type="button"
                                                class="btn btn-sm btn-dark"
                                                style="line-height: 1; padding: 2px 6px;"
                                                wire:click="toggle({{ $cat->id }})"
                                                title="Свернуть / развернуть"
                                            >
                                                @if (in_array($cat->id, $expanded ?? [], true))
                                                    ▾
                                                @else
                                                    ▸
                                                @endif
                                            </button>
                                        @else
                                            <span style="display:inline-block; width: 26px;"></span>
                                        @endif

                                        <strong>{{ str_repeat('— ', (int) ($row['depth'] ?? 0)) }}{{ $cat->title }}</strong>
                                    </div>
                                    <small class="text-muted">{{ $row['path'] }}</small>
                                </td>
                                <td><span class="badge badge-secondary">{{ $cat->slug }}</span></td>
                                <td>{{ $cat->position }}</td>
                                <td>
                                    @if ($cat->status == 0)
                                        <button wire:click="toggleStatus({{ $cat->id }})" class="btn btn-sm btn-success" title="Нажмите чтобы выключить">
                                            Включен
                                        </button>
                                    @else
                                        <button wire:click="toggleStatus({{ $cat->id }})" class="btn btn-sm btn-danger" title="Нажмите чтобы включить">
                                            Выключен
                                        </button>
                                    @endif
                                </td>
                                <td>
                                    <a class="btn btn-sm btn-info" href="{{ route('admin.editcategory', ['category_id' => $cat->id]) }}">Редактировать</a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6">Категорий пока нет.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>

                {{ $rows->links('pagination-links') }}
            </div>
        </div>
    </div>

    <div class="loadingSpinner" wire:loading>
        <svg width="200" height="200" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_OSmW{transform-origin:center;animation:spinner_T6mA .75s step-end infinite}@keyframes spinner_T6mA{8.3%{transform:rotate(30deg)}16.6%{transform:rotate(60deg)}25%{transform:rotate(90deg)}33.3%{transform:rotate(120deg)}41.6%{transform:rotate(150deg)}50%{transform:rotate(180deg)}58.3%{transform:rotate(210deg)}66.6%{transform:rotate(240deg)}75%{transform:rotate(270deg)}83.3%{transform:rotate(300deg)}91.6%{transform:rotate(330deg)}100%{transform:rotate(360deg)}}</style><g class="spinner_OSmW"><rect x="11" y="1" width="2" height="5" opacity=".14"/><rect x="11" y="1" width="2" height="5" transform="rotate(30 12 12)" opacity=".29"/><rect x="11" y="1" width="2" height="5" transform="rotate(60 12 12)" opacity="1"/><rect x="11" y="1" width="2" height="5" transform="rotate(90 12 12)" opacity=".9"/><rect x="11" y="1" width="2" height="5" transform="rotate(120 12 12)" opacity=".71"/><rect x="11" y="1" width="2" height="5" transform="rotate(150 12 12)" opacity=".86"/><rect x="11" y="1" width="2" height="5" transform="rotate(180 12 12)"/></g></svg>
    </div>
</div>
