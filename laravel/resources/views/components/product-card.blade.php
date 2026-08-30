@props([
    'product',
])

@php
    $img = $product->images->first();
    $imgUrl = $img
        ? asset('assets/images/products/' . $img->file_name)
        : asset('assets/images/design/no-image.jpg');

    $oldPrice = $product->price;
    $salePrice = $product->selling_price;
    $hasSale = !empty($salePrice) && (float) $salePrice > 0 && (float) $salePrice < (float) $oldPrice;

    $remark = (string) ($product->remark ?? '');

    $badgeText = null;
    $badgeClass = null;
    if ($remark === 'sale') {
        $badgeText = 'Акция';
        $badgeClass = 'product__item-trend-sale';
    } elseif ($remark === 'new') {
        $badgeText = 'Новинка';
        $badgeClass = 'product__item-trend-new';
    } elseif ($remark === 'hit') {
        $badgeText = 'Хит продаж';
        $badgeClass = 'product__item-trend-hit';
    }
@endphp

<div class="product__item">
    <a href="{{ route('product.details', ['slug' => $product->slug]) }}" class="product__item-link">
        <p class="product__item-img-wrap">
            <img src="{{ $imgUrl }}" class="product__item-img" alt="{{ $product->title }}">
        </p>

        <h4 class="product-title">{!! $product->title !!}</h4>
    </a>

    @if ($hasSale)
        <div class="product__item_price_wrap">
            <div class="product__item-price red">
                {{ number_format($oldPrice, 0, '.', ' ') }}<span>тг</span>
            </div>
            <div class="product__item_sale_price">
                {{ number_format($salePrice, 0, '.', ' ') }}<span>тг</span>
            </div>
        </div>
    @else
        <p class="product__item-price">
            {{ number_format($oldPrice, 0, '.', ' ') }}<span>тг</span>
        </p>
    @endif

    @if ($badgeText)
        <div class="product__item-trend {{ $badgeClass }}">
            {{ $badgeText }}
        </div>
    @endif

    <livewire:product-card-actions-component :product-id="$product->id" :key="'pca-'.$product->id" />
</div>
