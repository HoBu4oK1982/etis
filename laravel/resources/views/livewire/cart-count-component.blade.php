<a href="{{ route('cart') }}" class="header__cart header_position">
    <img src="{{ asset('assets/images/design/cart.png') }}" class="rotated__img" alt="Корзина">
    <p>Корзина</p>
    <span>{{ Cart::instance('cart')->count() }}</span>
</a>