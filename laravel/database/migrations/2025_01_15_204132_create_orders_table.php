<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id')->unsigned();
            $table->bigInteger('subtotal');
            $table->bigInteger('total');
            $table->string('user_name');
            $table->string('mobile');
            $table->string('email');
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->date('delivered_date')->nullable();
            $table->date('canceled_date')->nullable();
            $table->enum('status', ['ordered', 'delivered', 'canceled'])->default('ordered');
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
