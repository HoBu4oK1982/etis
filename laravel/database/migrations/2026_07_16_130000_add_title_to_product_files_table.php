<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('product_files', function (Blueprint $table) {
            if (!Schema::hasColumn('product_files', 'title')) {
                // Пользовательский заголовок PDF (то, что отображается на витрине).
                // nullable — существующие записи получат NULL; в UI используется fallback на original_name.
                $table->string('title')->nullable()->after('product_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('product_files', function (Blueprint $table) {
            if (Schema::hasColumn('product_files', 'title')) {
                $table->dropColumn('title');
            }
        });
    }
};
