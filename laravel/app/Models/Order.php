<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';

    protected $fillable = [
        'checkout_token',
        'user_id',
        'subtotal',
        'total',
        'user_name',
        'mobile',
        'email',
        'address',
        'city',
        'delivery_type',
        'comment',
        'status',
    ];

    protected $casts = [
        'subtotal' => 'integer',
        'total' => 'integer',
        'delivered_date' => 'date',
        'canceled_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
