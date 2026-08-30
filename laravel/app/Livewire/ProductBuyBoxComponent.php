<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Product;
use Cart;

class ProductBuyBoxComponent extends Component
{
    public int $productId;

    public $qty = 1;

    public bool $isWished = false;

    public function mount(int $productId): void
    {
        $this->productId = $productId;
        $this->qty = 1;

        $this->isWished = Cart::instance('wishlist')
            ->content()
            ->pluck('id')
            ->contains($this->productId);
    }

    public function updatedQty($value): void
    {
        $this->qty = max(1, (int) $value);
    }

    public function increaseQuantity(): void
    {
        $this->qty = max(1, (int) $this->qty + 1);
    }

    public function decreaseQuantity(): void
    {
        $this->qty = max(1, (int) $this->qty - 1);
    }

    public function addToCart(): void
    {
        $p = Product::find($this->productId);
        if (!$p) return;

        $price = $p->selling_price ?? $p->price;

        $availableQty = $p->qty ?? 999999999;

        $existing = Cart::instance('cart')->content()->where('id', $p->id)->first();
        $currentQty = $existing ? (int) $existing->qty : 0;

        $toAdd = max(1, (int) $this->qty);

        if (($currentQty + $toAdd) > (int) $availableQty) {
            $this->dispatch('cart-error', prodQty: (int) $availableQty, prodQtyCart: $currentQty);
            return;
        }

        if ($existing) {
            Cart::instance('cart')->update($existing->rowId, $currentQty + $toAdd);
        } else {
            Cart::instance('cart')
                ->add($p->id, $p->title, $toAdd, $price)
                ->associate(Product::class);
        }

        $this->dispatch('cart-updated', prodId: $p->id, prodName: $p->title);
        $this->dispatch('refreshComponent')->to('cart-count-component');
    }

    public function toggleWishlist(): void
    {
        $p = Product::find($this->productId);
        if (!$p) return;

        if ($this->isWished) {
            foreach (Cart::instance('wishlist')->content() as $witem) {
                if ((int) $witem->id === (int) $p->id) {
                    Cart::instance('wishlist')->remove($witem->rowId);
                    break;
                }
            }

            $this->isWished = false;

            $this->dispatch('wish-deleted', prodId: $p->id, prodName: $p->title);
            $this->dispatch('refreshComponent')->to('wishlist-count-component');
            return;
        }

        $price = $p->selling_price ?? $p->price;

        Cart::instance('wishlist')
            ->add($p->id, $p->title, 1, $price)
            ->associate(Product::class);

        $this->isWished = true;

        $this->dispatch('wish-added', prodId: $p->id, prodName: $p->title);
        $this->dispatch('refreshComponent')->to('wishlist-count-component');
    }

    public function render()
    {
        return view('livewire.product-buy-box-component');
    }
}