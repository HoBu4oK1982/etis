@section ('title', "Новинки магазина")

<div class="container">
    <div class="shopCategoryWrapper">
        <h1 class="davrTitle">Новинки магазина</h1>

        <x-breadcrumbs :items="[
            ['title' => 'Магазин', 'url' => route('shop')],
            ['title' => 'Новинки магазина', 'url' => null],
        ]" />

        <div class="remark__pages__content">
            @foreach ($remark__new as $new)
                <x-product-card :product="$new" />
            @endforeach
        </div>
    </div>
</div>
