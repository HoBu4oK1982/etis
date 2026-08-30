<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductFile extends Model
{
    protected $table = 'product_files';

    protected $fillable = [
        'product_id',
        'title',          // ← пользовательский заголовок PDF (то, что отображается на витрине)
        'original_name',
        'path',
        'size',
        'position',
    ];

    protected $casts = [
        'product_id' => 'integer',
        'size'       => 'integer',
        'position'   => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
