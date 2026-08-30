<div class="productCardActions">
    <button type="button"
            class="btn product__item-cart"
            wire:click="addToCart"
            wire:loading.attr="disabled">
        В корзину
    </button>

    @if($isWished)
        <button type="button"
                class="btn-wishlist"
                wire:click="removeFromWishlist"
                wire:loading.attr="disabled">
            Убрать избранного
        </button>
    @else
        <button type="button"
                class="btn-wishlist"
                wire:click="addToWishlist"
                wire:loading.attr="disabled">
            Добавить избранное
        </button>
    @endif
</div>
