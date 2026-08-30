@section('title', 'Избранное')
<section class="favourite__wrap">
    <div class="container">
        <h1>Избранное</h1>
        <x-breadcrumbs :items="[
            ['title' => 'Избранное', 'url' => null],
        ]" />
        <div class="wishlistWraper">
            @if(Cart::instance('wishlist')->content()->count() > 0)
                <div class="wishlistProducts">
                    @foreach(Cart::instance('wishlist')->content() as $item)
                    <div class="product__item productFavourite">
                        @php
                            $img = $item->model->images->first();
                            $imgUrl = $img
                                ? asset('assets/images/products/' . $img->file_name)
                                : asset('assets/images/design/no-image.jpg');
                            $price = $item->model->selling_price ?? $item->model->price;
                        @endphp
                        <a href="{{route('product.details', ['slug' => $item->model->slug])}}" class="productImg"><img src="{{ $imgUrl }}" alt="{{$item->model->title}}"></a>
                        <a href="{{route('product.details', ['slug' => $item->model->slug])}}" class="productTitle"><h3>{{$item->model->title}}</h3></a>
                        <p>{{$item->model->short_description}}</p>
                        <div class="product__item-price">{{ number_format($price, 0, '.', ' '); }} 〒</div>
                        <div class="productCartWrap">
                            <a href="#" class="productCartBtn wishGoToCart" wire:click.prevent="moveProductFromWishlistToCart('{{ $item->rowId }}')">Переместить в корзину</a>
                            <div class="Wishlistproduct">
                                <a href="#" wire:click.prevent="removeFromWishlist({{$item->model->id}})"><i class="fa fa-heart fill-heart"></i>Убрать из избранного</a>
                            </div>
                        </div>
                    </div>
                    @endforeach
                </div>
            @else
                <div class="wishlistWrap">
                    <h2>В избранном ничего нет!</h2>
                    <svg xmlns="http://www.w3.org/2000/svg" id="Слой_1" data-name="Слой 1" viewBox="0 0 239.09 212.83"><defs><style>.cls-1{fill:#1f1f1f;}</style></defs><title>heart</title><path class="cls-1" d="M897.72,398.29c-47.34-61.05-108,18.12-108,18.12s-60.69-79.17-108-18.12c-55.56,71.64,108,189.71,108,189.71S953.27,469.93,897.72,398.29Z" transform="translate(-670.14 -375.17)"/></svg>
                </div>
            @endif
        </div>
    </div>
</section>
