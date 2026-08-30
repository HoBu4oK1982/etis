@section ('title', "Хиты продаж - Страйкбольный магазин №1 в Казахстане")

<div class="container">
    <div class="shopCategoryWrapper">
        <h1 class="davrTitle">Хиты продаж</h1>

        <x-breadcrumbs :items="[
            ['title' => 'Магазин', 'url' => route('shop')],
            ['title' => 'Хиты продаж', 'url' => null],
        ]" />

        <div class="remark__pages__content">
            @foreach ($remark__hit as $hit)
                <x-product-card :product="$hit" />
            @endforeach
        </div>
    </div>
</div>
