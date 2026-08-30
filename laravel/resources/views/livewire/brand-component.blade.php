@section('title', $brand->title)
@section('meta_description', $brand->description ? strip_tags($brand->description) : '')

<div class="container">
    <div class="shopCategoryWrapper">
        <h1 class="davrTitle">{{ $brand->title }}</h1>

        <x-breadcrumbs :items="$breadcrumbs" />

        @if(!empty($brand->description))
            <div style="margin: 10px 0 20px; opacity: .9;">
                {!! $brand->description !!}
            </div>
        @endif

        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px; flex-wrap:wrap;">
            <div class="sort-item orderby">
                <select wire:model.live="sort" class="use-chosen">
                    <option value="default">Сортировка: по умолчанию</option>
                    <option value="date">Сначала новые</option>
                    <option value="price">Цена: по возрастанию</option>
                    <option value="price-desc">Цена: по убыванию</option>
                </select>
            </div>
            <div style="opacity:.75;">Найдено: {{ $products->total() }}</div>
        </div>

        <div class="remark__pages__content">
            @forelse($products as $p)
                <x-product-card :product="$p" />
            @empty
                <div style="padding:20px;">Товары не найдены.</div>
            @endforelse
        </div>

        <div style="margin-top:20px;">
            {{ $products->links() }}
        </div>
    </div>
</div>
