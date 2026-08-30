<?php

namespace App\Livewire;

use App\Models\Product;
use Carbon\Carbon;
use Livewire\Component;
use Cart;
use Illuminate\Support\Facades\Auth;

class CartComponent extends Component
{
    

    public function increaseQuantity($rowId, $id){
        $product = Cart::instance('cart')->get($rowId);

        $productCheck = Product::where('id', $id)->first();
        $availableQty = $productCheck?->qty ?? 999999999;
        if ($availableQty > $product->qty) {
            $qty = $product->qty + 1;
            Cart::instance('cart')->total();
            Cart::instance('cart')->update($rowId, $qty);
            $this->dispatch('refreshComponent')->to('cart-count-component'); 
        } else {
            $this->dispatch('cart-error', prodQty: (int)$availableQty, prodQtyCart: (int)$product->qty );
        }
    }

    public function decreaseQuantity($rowId){
        $product = Cart::instance('cart')->get($rowId);
        $qty = $product->qty - 1;
        Cart::instance('cart')->update($rowId, $qty);
        $this->dispatch('refreshComponent')->to('cart-count-component'); 
    }

    public function destroy($rowId){
        Cart::instance('cart')->remove($rowId);
        $this->dispatch('refreshComponent')->to('cart-count-component'); 
        session()->flash('success_message', 'Товар был удален');
    }

    public function destroyAll(){
        Cart::instance('cart')->destroy();
        $this->dispatch('refreshComponent')->to('cart-count-component'); 
    }

    public function checkout(){
        if(Auth::check()){
            return redirect()->route('checkout');
        }else{
            return redirect()->route('login');
        }
    }

    public function setAmountForCheckout(){
        if(!Cart::instance('cart')->count() > 0){
            session()->forget('checkout');
            return;
        };
        if(session()->has('coupon')){
            session()->put('checkout', [
                'discount' => $this->discount,
                'subtotal' => $this->subtotalAfterDiscount,
                'total' => $this->totalAfterDiscount
            ]);
        }else{
            session()->put('checkout', [
                'discount' => 0,
                'subtotal' => Cart::instance('cart')->subtotal(),
                'total' => Cart::instance('cart')->total()
            ]);
        }
    }

    public function render()
    {
        if(session()->has('coupon')){
            if(Cart::instance('cart')->subtotal() < session()->get('coupon')['cart_value']){
                session()->forget('coupon');
            }else{
                $this-> calculateDiscount();
            }
        }
        $this->setAmountForCheckout();
        return view('livewire.cart-component')->layout('layouts.base');
    }
}
