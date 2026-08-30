<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    protected $table = "articles";

    protected $fillable = [
        'title',
        'slug',
        'image',
        'description',
        'short_description',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'status',
    ];
}
