<a href="{{ route('favourite') }}" class="header__favourite header_position">
    <img src="{{ asset('assets/images/design/heart_icon.png') }}" class="rotated__img" alt="Избранное">
    <p>Избранное</p>
    <span>{{ Cart::instance('wishlist')->count() }}</span>
</a>
