<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('product_attributes', function (Blueprint $table) {
            // pair = "Значение/Описание" (name/value), html = rich content with images (content)
            if (!Schema::hasColumn('product_attributes', 'type')) {
                $table->string('type')->default('pair')->after('product_id');
            }
            if (!Schema::hasColumn('product_attributes', 'content')) {
                $table->longText('content')->nullable()->after('value');
            }
        });
    }

    public function down(): void
    {
        Schema::table('product_attributes', function (Blueprint $table) {
            if (Schema::hasColumn('product_attributes', 'content')) {
                $table->dropColumn('content');
            }
            if (Schema::hasColumn('product_attributes', 'type')) {
                $table->dropColumn('type');
            }
        });
    }
};
