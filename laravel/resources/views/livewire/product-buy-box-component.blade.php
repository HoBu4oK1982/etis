<div class="buyBox" wire:key="buybox-ui-{{ $productId }}">
    <div class="quantity">
        <span>Количество:</span>
        <div class="quantity-input">
            <button type="button"
                    class="btn btn-reduce"
                    wire:click="decreaseQuantity"
                    wire:loading.attr="disabled"
                    aria-label="Уменьшить">-</button>

            <input type="number"
                    min="1"
                    step="1"
                    inputmode="numeric"
                    name="product-quantity"
                    wire:model.number="qty">

            <button type="button"
                    class="btn btn-increase"
                    wire:click="increaseQuantity"
                    wire:loading.attr="disabled"
                    aria-label="Увеличить">+</button>
        </div>
    </div>

    {{-- ✅ ВАЖНО: key должен быть стабильным (НЕ включать qty), иначе Snapshot missing --}}
    <div class="wrap-butons">
        <button type="button" class="btn product__item-cart" wire:click="addToCart" wire:loading.attr="disabled">
            В корзину
        </button>

        <button type="button" class="btn-wishlist" wire:click="toggleWishlist" wire:loading.attr="disabled">
            {{ $isWished ? 'Убрать из избранного' : 'В избранное' }}
        </button>
    </div>
</div>