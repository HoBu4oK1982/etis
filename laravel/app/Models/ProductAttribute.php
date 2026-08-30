<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductAttribute extends Model
{
    protected $table = 'product_attributes';

    protected $fillable = [
        'product_id',
        'type', // pair | html
        'name',
        'value',
        'content',
        'position',
    ];

    protected $casts = [
        'product_id' => 'integer',
        'position' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
