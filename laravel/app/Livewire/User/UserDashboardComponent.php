<?php

namespace App\Livewire\User;

use App\Models\Order;
use App\Models\UserProfile;
use Illuminate\Support\Facades\Auth;
use Livewire\Component;
use Livewire\WithPagination;
use Cart;

class UserDashboardComponent extends Component
{
    use WithPagination;

    /**
     * dashboard | orders | wishlist | profile
     */
    public $tab = 'dashboard';

    public $selectedOrderId = null;

    // User
    public $name;
    public $email;

    // Custom profile fields (user_profiles)
    public $phone;
    public $city;
    public $address;

    protected $queryString = [
        'tab' => ['except' => 'dashboard'],
    ];

    public function mount(): void
    {
        $user = Auth::user()->loadMissing('profile');

        $this->name = $user->name;
        $this->email = $user->email;

        $this->phone = $user->profile->phone ?? null;
        $this->city = $user->profile->city ?? null;
        $this->address = $user->profile->address ?? null;

        $this->tab = in_array($this->tab, ['dashboard','orders','wishlist','profile'], true)
            ? $this->tab
            : 'dashboard';
    }

    public function setTab(string $tab): void
    {
        $this->tab = in_array($tab, ['dashboard','orders','wishlist','profile'], true) ? $tab : 'dashboard';
        $this->selectedOrderId = null;
        $this->resetPage();
        $this->resetErrorBag();
    }

    public function viewOrder(int $orderId): void
    {
        $this->tab = 'orders';
        $this->selectedOrderId = $orderId;
        $this->resetErrorBag();
    }

    public function backToOrders(): void
    {
        $this->selectedOrderId = null;
        $this->resetErrorBag();
    }

    public function updateProfile(): void
    {
        $this->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'city' => ['nullable', 'string', 'max:120'],
            'address' => ['nullable', 'string', 'max:255'],
        ], [
            'name.required' => 'Введите имя.',
        ]);

        $user = Auth::user();

        $user->name = $this->name;
        $user->save();

        UserProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'phone' => $this->phone ?: null,
                'city' => $this->city ?: null,
                'address' => $this->address ?: null,
            ]
        );

        session()->flash('profile_saved', 'Профиль обновлён.');
    }

    // ===== Wishlist actions (как в WishlistComponent) =====
    public function removeFromWishlist(int $product_id): void
    {
        foreach (Cart::instance('wishlist')->content() as $witem) {
            if ((int)$witem->id === (int)$product_id) {
                Cart::instance('wishlist')->remove($witem->rowId);
                $this->dispatch('refreshComponent')->to('wishlist-count-component');
                return;
            }
        }
    }

    public function moveProductFromWishlistToCart(string $rowId): void
    {
        $item = Cart::instance('wishlist')->get($rowId);
        if (!$item) return;

        Cart::instance('wishlist')->remove($rowId);
        Cart::instance('cart')->add($item->id, $item->name, 1, $item->price)->associate('App\Models\Product');

        $this->dispatch('refreshComponent')->to('wishlist-count-component');
        $this->dispatch('refreshComponent')->to('cart-count-component');
    }

    public function render()
    {
        $user = Auth::user();

        $ordersQuery = Order::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at');

        $orders = (clone $ordersQuery)->paginate(10);
        $ordersCount = (clone $ordersQuery)->count();
        $lastOrder = (clone $ordersQuery)->first();

        $selectedOrder = null;
        if ($this->tab === 'orders' && $this->selectedOrderId) {
            $selectedOrder = Order::query()
                ->where('id', $this->selectedOrderId)
                ->where('user_id', $user->id)
                ->with('orderItems.product')
                ->first();
        }

        // ✅ вот это решает твою ошибку Undefined variable $wishlistCount
        $wishlistCount = Cart::instance('wishlist')->count();

        return view('livewire.user.user-dashboard-component', [
            'user' => $user,
            'orders' => $orders,
            'ordersCount' => $ordersCount,
            'lastOrder' => $lastOrder,
            'selectedOrder' => $selectedOrder,
            'wishlistCount' => $wishlistCount,
        ])->layout('layouts.base');
    }
}
