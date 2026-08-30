@section ('title', "Поиск")

<div class="container">
    <div class="shopCategoryWrapper">
        <h1 class="davrTitle">Поиск по: {{$search}}</h1>

        <x-breadcrumbs :items="[
            ['title' => 'Магазин', 'url' => route('shop')],
            ['title' => 'Поиск', 'url' => null],
        ]" />

        <div class="shopMiddleWrap">
            <div class="searchContentWrapper">

                <div class="shopSort">
                    <div class="sort-item orderby ">
                        <select name="orderby" class="use-chosen" wire:model.live="sorting">
                            <option value="deafult" selected="selected">Сортировка по умолчанию</option>
                            <option value="date">Сортировать по новизне</option>
                            <option value="price">Цена: сначала дешевые</option>
                            <option value="price-desc">Цена: сначала дорогие</option>
                        </select>
                    </div>

                    <div class="sort-item product-per-page">
                        <select name="post-per-page" class="use-chosen" wire:model.live="pagesize">
                            <option value="20">20 на странице</option>
                            <option value="25">25 на странице</option>
                            <option value="30" selected="selected">30 на странице</option>
                            <option value="40">40 на странице</option>
                            <option value="45">45 на странице</option>
                            <option value="50">50 на странице</option>
                        </select>
                    </div>
                </div>

                @if($products->count() > 0)
                    <div class="shopContent">
                        @php
                            $witems = Cart::instance('wishlist')->content()->pluck('id');
                        @endphp

                        @foreach ($products as $product)
                            <x-product-card :product="$product" />
                        @endforeach
                    </div>
                @endif

                <div class="shopPagination">
                    {{$products->links('pagination-links')}}
                </div>
            </div>
        </div>
    </div>
</div>
