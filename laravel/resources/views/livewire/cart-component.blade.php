@section('title', 'Корзина')
<section class="container cart__wrap">
        <h1>Корзина</h1>
        <x-breadcrumbs :items="[
            ['title' => 'Корзина', 'url' => null],
        ]" />
        <div class="cartContentWrap">
            @if(Session::has('success_message'))
                <div class="alertSuccess">{{ Session::get('success_message') }}</div>
            @endif
            @if(Cart::instance('cart')->count() > 0 || Cart::instance('cart')->count() === NULL)
                <div class="cartProducts">
                    @foreach(Cart::instance('cart')->content() as $item)
                        <div class="cartProduct">
                            <a href="{{ route('product.details', ['slug' => $item->model->slug]) }}"><h2>{{  $item->model->title }}</h2></a>
                            @php
                                $img = $item->model->images->first();
                                $imgUrl = $img
                                    ? asset('assets/images/products/' . $img->file_name)
                                    : asset('assets/images/design/no-image.jpg');
                                $oldPrice = $item->model->price;
                                $salePrice = $item->model->selling_price;
                                $hasSale = !empty($salePrice) && (float) $salePrice > 0 && (float) $salePrice < (float) $oldPrice;
                            @endphp
                            <img src="{{ $imgUrl }}" alt="" />

                            @if ($hasSale)
                                <div class="cartItemPrice red">{{ number_format($oldPrice, 0, '.', ' ') }} 〒<div class="cartSalePrice">{{ number_format($salePrice, 0, '.', ' ') }} 〒</div></div>
                            @else
                                <div class="cartItemPrice">{{ number_format($oldPrice, 0, '.', ' ') }} 〒</div>
                            @endif
                            <div class="cartProductQuantity">
                                <input type="text" name="product-quatity" value="{{ $item->qty }}" data-max="120" pattern="[0-9]*" >
                                <a class="btn btn-reduce" href="#"  wire:click.prevent="decreaseQuantity('{{ $item->rowId }}')" >-</a>
                                <a class="btn btn-increase" href="#" wire:click.prevent="increaseQuantity('{{ $item->rowId }}', {{ $item->id }})">+</a>
                            </div>
                            <div class="cartProductSubTotal"><p class="price">{{ number_format($item->subtotal, 0, '.', ' '); }} 〒</p></div>
                            <div class="cartProductDelete">
                                <a href="#" class="btn btn-delete" title="" wire:click.prevent="destroy('{{ $item->rowId }}')">
                                    х
                                </a>
                            </div>
                        </div>
                    @endforeach
                </div>
    
                <div class="cartDeleteAll" wire:click.prevent="destroyAll()">Очистить корзину</div>
                <div class="cartOrderSummary">
                    <h2>Состав заказа</h2>
                    <p class="summary-info"><span class="title">Сумма:</span><b class="index">{{ number_format(Cart::instance('cart')->subtotal(), 0, '.', ' '); }} 〒</b></p>
                {{-- <p class="summary-info"><span class="title">Доставка: </span><b class="index">цена договорная</b></p> --}}
                <p class="summary-info total-info "><span class="title">Итого: </span><b class="index">{{ number_format(Cart::instance('cart')->total() , 0, '.', ' '); }} 〒</b></p>
                </div>
                <div class="cartCheckoutWrap">
                    <div class="cartCheckout"><a href="#" wire:click.prevent="checkout">Оформить заказ</a></div>
                </div>
            @else
                <div class="cartEmpty">
                    <h2>Ваша корзина пуста!</h2>
                    <svg xmlns="http://www.w3.org/2000/svg" id="Слой_1" data-name="Слой 1" viewBox="0 0 132.65 130.33"><defs><style>.cls-1{fill:#1d2020;}.cls-2{fill:#fff;}</style></defs><title>cart</title><path class="cls-1" d="M776.78,469.93H705.72a11.7,11.7,0,0,1-11.65-10.46L686.15,386a10.5,10.5,0,0,0-.2-1.23,12.08,12.08,0,0,0-8.35-8.65l-12.41-4a3.81,3.81,0,0,1,2.34-7.25l12.42,4a19.72,19.72,0,0,1,13.46,14.3c.14.66.24,1.33.32,2l7.92,73.48a4.08,4.08,0,0,0,4.07,3.66h71.06a3.81,3.81,0,1,1,0,7.62Z" transform="translate(-662.55 -364.67)"/><path class="cls-1" d="M766.18,451.83H693.25L686.9,393h95.61a12.7,12.7,0,0,1,12,17l-10.52,29.35A18.91,18.91,0,0,1,766.18,451.83Zm-66.09-7.62h66.09a11.27,11.27,0,0,0,10.59-7.45l10.52-29.35a5.09,5.09,0,0,0-4.78-6.8H695.39Z" transform="translate(-662.55 -364.67)"/><line class="cls-2" x1="123.41" y1="57.74" x2="31.36" y2="57.74"/><rect class="cls-1" x="31.36" y="55.84" width="92.05" height="3.81"/><line class="cls-2" x1="50.04" y1="83.35" x2="43.05" y2="32.13"/><rect class="cls-1" x="707.19" y="396.56" width="3.81" height="51.7" transform="translate(-713.12 -265) rotate(-7.76)"/><line class="cls-2" x1="67.5" y1="83.35" x2="65.91" y2="32.13"/><rect class="cls-1" x="727.35" y="396.78" width="3.81" height="51.25" transform="translate(-675.29 -341.87) rotate(-1.78)"/><line class="cls-2" x1="85.6" y1="83.35" x2="89.73" y2="32.13"/><rect class="cls-1" x="724.52" y="420.5" width="51.39" height="3.81" transform="translate(-393.08 771.98) rotate(-85.44)"/><line class="cls-2" x1="102.44" y1="83.35" x2="111.32" y2="32.13"/><rect class="cls-1" x="743.44" y="420.5" width="51.99" height="3.81" transform="translate(-440.89 743.6) rotate(-80.15)"/><path class="cls-1" d="M719.86,485.48a9.53,9.53,0,1,1-9.52-9.53A9.52,9.52,0,0,1,719.86,485.48Z" transform="translate(-662.55 -364.67)"/><path class="cls-1" d="M768.49,485.48A9.53,9.53,0,1,1,759,476,9.52,9.52,0,0,1,768.49,485.48Z" transform="translate(-662.55 -364.67)"/></svg>
                    <a href="{{route('shop')}}">Начать покупки</a>
                </div>
            @endif
        </div>

</section>
