<div class="container">
    <style>
        nav svg{ height: 20px; }
        nav .hidden{ display: block !important; }
    </style>
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Все слайды</h1>
    </div>
    <div class="row">
        <div class="card mx-auto" style="width:100%">
            <div>
                @if (session()->has('message'))
                    <div class="alert alert-success">{{ session('message') }}</div>
                @endif
            </div>
            <div class="card-header">
                <div class="row">
                    <div>
                        <a href="{{ route('admin.addslide') }}" class="btn btn-primary mb-2">Создать слайд</a>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Id</th>
                            <th scope="col">Изображение</th>
                            <th scope="col">Заголовок</th>
                            <th scope="col">Подзаголовок</th>
                            <th scope="col">Позиция</th>
                            <th scope="col">Ссылка</th>
                            <th scope="col">Статус</th>
                            <th scope="col">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        @if (count($slides) > 0)
                            @foreach ($slides as $slide)
                                <tr>
                                    <th scope="row">{{ $slide->id }}</th>
                                    <td>
                                        @if ($slide->image)
                                            <img src="{{ asset('assets/images/sliders/' . $slide->image) }}"
                                                 width="120" alt="{{ $slide->title }}">
                                        @else
                                            <span class="text-muted">нет</span>
                                        @endif
                                    </td>
                                    <td>
                                        @if ($slide->eyebrow)
                                            <div class="small text-muted text-uppercase">{{ $slide->eyebrow }}</div>
                                        @endif
                                        <strong>{{ $slide->title ?: '—' }}</strong>
                                    </td>
                                    <td>
                                        <div class="small">{{ \Illuminate\Support\Str::limit($slide->subtitle, 80) }}</div>
                                    </td>
                                    <td>{{ $slide->position }}</td>
                                    <td>{{ $slide->link }}</td>
                                    <td>
                                        @if ($slide->status == 0)
                                            <span class="badge badge-success">Включен</span>
                                        @else
                                            <span class="badge badge-danger">Выключен</span>
                                        @endif
                                    </td>
                                    <td>
                                        <a href="{{ route('admin.editslide', ['slide_id' => $slide->id]) }}"
                                           class="btn btn-info btn-sm">Редактировать</a>
                                    </td>
                                </tr>
                            @endforeach
                        @else
                            <tr>
                                <td colspan="8">К сожалению слайдов пока нет!</td>
                            </tr>
                        @endif
                    </tbody>
                </table>
                {{ $slides->links('pagination-links') }}
            </div>
        </div>
    </div>

    <div class="loadingSpinner" wire:loading>
        <svg width="200" height="200" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_OSmW{transform-origin:center;animation:spinner_T6mA .75s step-end infinite}@keyframes spinner_T6mA{8.3%{transform:rotate(30deg)}16.6%{transform:rotate(60deg)}25%{transform:rotate(90deg)}33.3%{transform:rotate(120deg)}41.6%{transform:rotate(150deg)}50%{transform:rotate(180deg)}58.3%{transform:rotate(210deg)}66.6%{transform:rotate(240deg)}75%{transform:rotate(270deg)}83.3%{transform:rotate(300deg)}91.6%{transform:rotate(330deg)}100%{transform:rotate(360deg)}}</style><g class="spinner_OSmW"><rect x="11" y="1" width="2" height="5" opacity=".14"/><rect x="11" y="1" width="2" height="5" transform="rotate(30 12 12)" opacity=".29"/><rect x="11" y="1" width="2" height="5" transform="rotate(60 12 12)" opacity="1"/><rect x="11" y="1" width="2" height="5" transform="rotate(90 12 12)" opacity=".9"/><rect x="11" y="1" width="2" height="5" transform="rotate(120 12 12)" opacity=".71"/><rect x="11" y="1" width="2" height="5" transform="rotate(150 12 12)" opacity=".86"/><rect x="11" y="1" width="2" height="5" transform="rotate(180 12 12)"/></g></svg>
    </div>
</div>
