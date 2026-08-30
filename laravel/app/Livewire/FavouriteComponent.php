<?php

namespace App\Livewire;

use Livewire\Component;
use Cart;

class FavouriteComponent extends Component
{
    public function removeFromWishlist ($product_id){
        foreach(Cart::instance('wishlist')->content() as $witem){
            if($witem->id === $product_id){
                Cart::instance('wishlist')->remove($witem->rowId);
                $this->dispatch('refreshComponent')->to('wishlist-count-component'); 
                return;
            }
        }
    }

    public function moveProductFromWishlistToCart($rowId){
        $item = Cart::instance('wishlist')->get($rowId);
        Cart::instance('wishlist')->remove($rowId);
        Cart::instance('cart')->add($item->id, $item->name, 1, $item->price)->associate('App\Models\Product');
        $this->dispatch('refreshComponent')->to('wishlist-count-component'); 
        $this->dispatch('refreshComponent')->to('cart-count-component');
    }
    
    public function render()
    {
        return view('livewire.favourite-component')->layout('layouts.base');
    }
}
