<div class="container">
    <style>
        nav svg { height: 20px; }
        nav .hidden { display: block !important; }
    </style>

    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Бренды</h1>
        <a href="{{ route('admin.addbrand') }}" class="btn btn-primary">Создать бренд</a>
    </div>

    @if (session()->has('message'))
        <div class="alert alert-success">
            {{ session('message') }}
        </div>
    @endif

    <div class="card">
        <div class="card-body">
            <div class="row mb-3">
                <div class="col-md-6">
                    <input type="text" class="form-control" placeholder="Поиск по названию или slug..." wire:model.live.debounce.400ms="search" />
                </div>
                <div class="col-md-3">
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
                        <th style="width:90px">Картинка</th>
                        <th>Название</th>
                        <th>Slug</th>
                        <th style="width:90px">Позиция</th>
                        <th style="width:110px">Статус</th>
                        <th style="width:140px">Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    @forelse($brands as $b)
                        <tr>
                            <td>{{ $b->id }}</td>
                            <td>
                                @if($b->image)
                                    <img src="{{ asset('assets/images/brands/'.$b->image) }}" alt="" style="max-width:70px;max-height:50px;object-fit:contain" />
                                @else
                                    —
                                @endif
                            </td>
                            <td><strong>{{ $b->title }}</strong></td>
                            <td><span class="badge badge-secondary">{{ $b->slug }}</span></td>
                            <td>{{ (int)$b->position }}</td>
                            <td>
                                @if((int)$b->status === 0)
                                    <span class="badge badge-success">Включен</span>
                                @else
                                    <span class="badge badge-danger">Выключен</span>
                                @endif
                            </td>
                            <td>
                                <a class="btn btn-sm btn-info" href="{{ route('admin.editbrand', ['brand_id' => $b->id]) }}">Редактировать</a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7">Брендов пока нет.</td>
                        </tr>
                    @endforelse
                    </tbody>
                </table>

                {{ $brands->links('pagination-links') }}
            </div>
        </div>
    </div>

    <div class="loadingSpinner" wire:loading>
        <svg width="200" height="200" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_OSmW{transform-origin:center;animation:spinner_T6mA .75s step-end infinite}@keyframes spinner_T6mA{8.3%{transform:rotate(30deg)}16.6%{transform:rotate(60deg)}25%{transform:rotate(90deg)}33.3%{transform:rotate(120deg)}41.6%{transform:rotate(150deg)}50%{transform:rotate(180deg)}58.3%{transform:rotate(210deg)}66.6%{transform:rotate(240deg)}75%{transform:rotate(270deg)}83.3%{transform:rotate(300deg)}91.6%{transform:rotate(330deg)}100%{transform:rotate(360deg)}}</style><g class="spinner_OSmW"><rect x="11" y="1" width="2" height="5" opacity=".14"/><rect x="11" y="1" width="2" height="5" transform="rotate(30 12 12)" opacity=".29"/><rect x="11" y="1" width="2" height="5" transform="rotate(60 12 12)" opacity="1"/><rect x="11" y="1" width="2" height="5" transform="rotate(90 12 12)" opacity=".9"/><rect x="11" y="1" width="2" height="5" transform="rotate(120 12 12)" opacity=".71"/><rect x="11" y="1" width="2" height="5" transform="rotate(150 12 12)" opacity=".86"/><rect x="11" y="1" width="2" height="5" transform="rotate(180 12 12)"/></g></svg>
    </div>
</div>
