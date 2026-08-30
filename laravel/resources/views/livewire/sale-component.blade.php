@section ('title', "Акции")

<div class="container">
    <div class="shopCategoryWrapper">
        <h1 class="davrTitle">Акционные товары</h1>

        <x-breadcrumbs :items="[
            ['title' => 'Магазин', 'url' => route('shop')],
            ['title' => 'Акционные товары', 'url' => null],
        ]" />

        <div class="remark__pages__content">
            @foreach ($remark__sale as $sale)
                <x-product-card :product="$sale" />
            @endforeach
        </div>
    </div>
</div>
