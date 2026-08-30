<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('orders', 'delivery_type')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->string('delivery_type', 20)
                    ->default('delivery')
                    ->after('city');
            });
        }

        if (!Schema::hasColumn('orders', 'comment')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->text('comment')
                    ->nullable()
                    ->after('delivery_type');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('orders', 'comment')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('comment');
            });
        }

        if (Schema::hasColumn('orders', 'delivery_type')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('delivery_type');
            });
        }
    }
};
