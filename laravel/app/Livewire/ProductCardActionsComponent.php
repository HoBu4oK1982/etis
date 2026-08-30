<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\Attributes\On;
use App\Models\Product;
use Cart;

class ProductCardActionsComponent extends Component
{
    public int $productId;
    public bool $isWished = false;

    // qty приходит с product details через event
    public int $qty = 1;

    public function mount(int $productId): void
    {
        $this->productId = $productId;

        $this->isWished = Cart::instance('wishlist')
            ->content()
            ->pluck('id')
            ->contains($this->productId);
    }

    #[On('details-qty-updated')]
    public function setQty($qty): void
    {
        $this->qty = max(1, (int) $qty);
    }

    public function getProductProperty(): ?Product
    {
        return Product::query()->find($this->productId);
    }

    public function addToWishlist(): void
    {
        $p = $this->product;
        if (!$p) return;

        if ($this->isWished) {
            $this->dispatch('$refresh');
            return;
        }

        $price = $p->selling_price ?? $p->price;

        Cart::instance('wishlist')
            ->add($p->id, $p->title, 1, $price)
            ->associate(Product::class);

        $this->isWished = true;

        $this->dispatch('wish-added', prodId: $p->id, prodName: $p->title);
        $this->dispatch('refreshComponent')->to('wishlist-count-component');
        $this->dispatch('$refresh');
    }

    public function removeFromWishlist(): void
    {
        if (!$this->isWished) {
            $this->dispatch('$refresh');
            return;
        }

        $removedName = null;

        foreach (Cart::instance('wishlist')->content() as $witem) {
            if ((int) $witem->id === (int) $this->productId) {
                $removedName = $witem->name;
                Cart::instance('wishlist')->remove($witem->rowId);
                break;
            }
        }

        $this->isWished = false;

        $this->dispatch('wish-deleted', prodId: $this->productId, prodName: $removedName ?? 'Товар');
        $this->dispatch('refreshComponent')->to('wishlist-count-component');
        $this->dispatch('$refresh');
    }

    public function addToCart(): void
    {
        $p = $this->product;
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
        $this->dispatch('$refresh');
    }

    public function render()
    {
        return view('livewire.product-card-actions-component');
    }
}