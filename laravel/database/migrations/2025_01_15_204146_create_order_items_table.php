<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('product_id')->unsigned();
            $table->bigInteger('order_id')->unsigned();
            $table->integer('price');
            $table->integer('qty');
            $table->timestamps();            
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
