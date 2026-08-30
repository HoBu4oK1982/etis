<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();

            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('description')->nullable();
            $table->string('image')->nullable();

            $table->unsignedBigInteger('parent_id')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->unsignedTinyInteger('status')->default(0); // 0 = включена (по умолчанию)

            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();

            $table->timestamps();

            $table->index(['parent_id', 'position']);
            $table->foreign('parent_id')->references('id')->on('categories')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
