<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('sku')->nullable(); // артикул, не уникален
            $table->decimal('price', 12, 2)->default(0);
            $table->decimal('selling_price', 12, 2)->nullable();

            $table->unsignedBigInteger('category_id')->nullable()->index();

            $table->longText('description')->nullable();
            $table->text('short_description')->nullable();

            // 0 = включен (дефолт), 1 = выключен
            $table->tinyInteger('status')->default(0);

            // hit | sale | new
            $table->string('remark')->nullable()->index();

            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->text('meta_keywords')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
